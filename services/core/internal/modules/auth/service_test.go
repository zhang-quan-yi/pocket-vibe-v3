package auth

import (
	"context"
	"errors"
	"testing"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

func TestLoginSuccess(t *testing.T) {
	svc := NewMemoryAuthService()
	resp, err := svc.Login(context.Background(), contract.LoginRequest{
		Username: "demo",
		Password: "demo",
	})
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}
	if resp.Session.Token == "" {
		t.Fatal("expected session token")
	}
	if resp.User.Username != "demo" {
		t.Fatalf("expected username demo, got %q", resp.User.Username)
	}
	if resp.User.ID != "user_demo" {
		t.Fatalf("expected user id user_demo, got %q", resp.User.ID)
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	svc := NewMemoryAuthService()
	_, err := svc.Login(context.Background(), contract.LoginRequest{
		Username: "demo",
		Password: "wrong",
	})
	if !errors.Is(err, serviceerrors.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}

	_, err = svc.Login(context.Background(), contract.LoginRequest{
		Username: "unknown",
		Password: "demo",
	})
	if !errors.Is(err, serviceerrors.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized for unknown user, got %v", err)
	}
}

func TestValidateSessionSuccess(t *testing.T) {
	svc := NewMemoryAuthService()
	resp, err := svc.Login(context.Background(), contract.LoginRequest{
		Username: "demo",
		Password: "demo",
	})
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}

	user, err := svc.ValidateSession(context.Background(), resp.Session.Token)
	if err != nil {
		t.Fatalf("validate session failed: %v", err)
	}
	if user.ID != "user_demo" {
		t.Fatalf("expected user id user_demo, got %q", user.ID)
	}
}

func TestValidateSessionInvalidToken(t *testing.T) {
	svc := NewMemoryAuthService()
	_, err := svc.ValidateSession(context.Background(), "invalid_token")
	if !errors.Is(err, serviceerrors.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func TestLogout(t *testing.T) {
	svc := NewMemoryAuthService()
	resp, err := svc.Login(context.Background(), contract.LoginRequest{
		Username: "demo",
		Password: "demo",
	})
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}

	err = svc.Logout(context.Background(), resp.Session.Token)
	if err != nil {
		t.Fatalf("logout failed: %v", err)
	}

	_, err = svc.ValidateSession(context.Background(), resp.Session.Token)
	if !errors.Is(err, serviceerrors.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized after logout, got %v", err)
	}
}
