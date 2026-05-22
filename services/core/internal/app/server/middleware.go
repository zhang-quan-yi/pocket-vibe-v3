package server

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"sync/atomic"
	"time"
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
