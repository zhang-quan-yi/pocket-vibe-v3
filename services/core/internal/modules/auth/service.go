package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

// AuthService 管理用户认证和会话生命周期。
type AuthService interface {
	// Login 验证用户名密码，创建 session。
	// 验证失败返回 serviceerrors.ErrUnauthorized。
	Login(ctx context.Context, req contract.LoginRequest) (*contract.LoginResponse, error)

	// ValidateSession 校验 session token 是否有效且未过期。
	// 无效返回 serviceerrors.ErrUnauthorized，过期返回 serviceerrors.ErrSessionExpired。
	ValidateSession(ctx context.Context, token string) (*contract.User, error)

	// Logout 销毁 session。
	Logout(ctx context.Context, token string) error
}

// mockUser 是内置的 mock 用户。
type mockUser struct {
	user     contract.User
	password string
}

// sessionEntry 是内存中的 session 记录。
type sessionEntry struct {
	userID    string
	expiresAt time.Time
}

// MemoryAuthService 是 AuthService 的内存 mock 实现。
type MemoryAuthService struct {
	mu       sync.Mutex
	users    map[string]mockUser // username -> mockUser
	sessions map[string]sessionEntry // token -> sessionEntry
}

// NewMemoryAuthService 创建一个内置 mock 用户的 MemoryAuthService。
func NewMemoryAuthService() *MemoryAuthService {
	users := map[string]mockUser{
		"demo": {
			user: contract.User{
				ID:       "user_demo",
				Username: "demo",
				Email:    "demo@pocket-vibe.local",
			},
			password: "demo",
		},
	}
	return &MemoryAuthService{
		users:    users,
		sessions: map[string]sessionEntry{},
	}
}

func (s *MemoryAuthService) Login(ctx context.Context, req contract.LoginRequest) (*contract.LoginResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	mock, ok := s.users[req.Username]
	if !ok || mock.password != req.Password {
		return nil, serviceerrors.ErrUnauthorized
	}

	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	s.sessions[token] = sessionEntry{
		userID:    mock.user.ID,
		expiresAt: expiresAt,
	}

	return &contract.LoginResponse{
		Session: contract.Session{
			Token:     token,
			UserID:    mock.user.ID,
			ExpiresAt: expiresAt.UTC().Format(time.RFC3339),
		},
		User: mock.user,
	}, nil
}

func (s *MemoryAuthService) ValidateSession(ctx context.Context, token string) (*contract.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.sessions[token]
	if !ok {
		return nil, serviceerrors.ErrUnauthorized
	}

	if time.Now().After(entry.expiresAt) {
		delete(s.sessions, token)
		return nil, serviceerrors.ErrSessionExpired
	}

	for _, mock := range s.users {
		if mock.user.ID == entry.userID {
			user := mock.user
			return &user, nil
		}
	}

	return nil, serviceerrors.ErrUserNotFound
}

func (s *MemoryAuthService) Logout(ctx context.Context, token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, token)
	return nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return "sess_" + hex.EncodeToString(b), nil
}
