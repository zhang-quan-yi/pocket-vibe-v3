package main

import (
	"log"
	"net/http"
	"os"

	"pocket-vibe-v3/services/core/internal/app/server"
)

func main() {
	addr := os.Getenv("POCKET_VIBE_API_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	log.Printf("Pocket Vibe mock API listening on %s", addr)
	if err := http.ListenAndServe(addr, server.New()); err != nil {
		log.Fatal(err)
	}
}
