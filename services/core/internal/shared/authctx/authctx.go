package authctx

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

type userContextKey struct{}

// WithUser 将 User 注入 context。
func WithUser(ctx context.Context, user *contract.User) context.Context {
	return context.WithValue(ctx, userContextKey{}, user)
}

// User 从 context 中提取当前用户。未认证时返回 nil。
func User(ctx context.Context) *contract.User {
	user, _ := ctx.Value(userContextKey{}).(*contract.User)
	return user
}

// RequireUser 从 context 中提取当前用户。未认证时返回 false。
func RequireUser(ctx context.Context) (*contract.User, bool) {
	user := User(ctx)
	return user, user != nil
}
