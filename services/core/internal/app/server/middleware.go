package server

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	authmod "pocket-vibe-v3/services/core/internal/modules/auth"
	"pocket-vibe-v3/services/core/internal/shared/authctx"
	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

type traceIDContextKey struct{}

var traceCounter atomic.Uint64

func withRequestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s trace=%s", r.Method, r.URL.Path, traceIDFromContext(r.Context()))
		next.ServeHTTP(w, r)
	})
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func withTraceID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		traceID := newTraceID()
		w.Header().Set("X-Trace-Id", traceID)
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), traceIDContextKey{}, traceID)))
	})
}

func newTraceID() string {
	return "trace_" + strconv.FormatInt(time.Now().UnixNano(), 36) + "-" + strconv.FormatUint(traceCounter.Add(1), 36)
}

func traceIDFromContext(ctx context.Context) string {
	traceID, _ := ctx.Value(traceIDContextKey{}).(string)
	return traceID
}

// withAuth 从 Authorization header 提取 Bearer token，校验后注入 User 到 context。
// required=true 时，未认证请求返回 401；required=false 时，未认证请求继续执行但 ctx 无 User。
func withAuth(authService authmod.AuthService, required bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractBearerToken(r)
			if token == "" {
				if required {
					writeRequestError(w, r, http.StatusUnauthorized, contract.ErrAuthRequired, "Missing session token.")
					return
				}
				next.ServeHTTP(w, r)
				return
			}
			user, err := authService.ValidateSession(r.Context(), token)
			if err != nil {
				if required {
					code := contract.ErrAuthRequired
					if errors.Is(err, serviceerrors.ErrSessionExpired) {
						code = contract.ErrSessionExpired
					}
					writeRequestError(w, r, http.StatusUnauthorized, code, err.Error())
					return
				}
				next.ServeHTTP(w, r)
				return
			}
			ctx := authctx.WithUser(r.Context(), user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func extractBearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if h == "" {
		return ""
	}
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}
