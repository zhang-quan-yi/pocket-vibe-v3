package file

import (
	"context"
	"testing"
)

func TestLocalFixtureServiceListTreeAndGetContent(t *testing.T) {
	svc := &LocalFixtureService{}
	tree, err := svc.ListTree(context.Background(), "mock-pocket-vibe")
	if err != nil {
		t.Fatalf("ListTree() error = %v", err)
	}
	if len(tree) == 0 || tree[0].Path != "src" {
		t.Fatalf("expected src root node, got %#v", tree)
	}

	content, err := svc.GetContent(context.Background(), "mock-pocket-vibe", "src/reader/context.ts")
	if err != nil {
		t.Fatalf("GetContent() error = %v", err)
	}
	if content.LineCount == 0 || content.Language != "typescript" {
		t.Fatalf("unexpected content metadata: %#v", content)
	}
}

func TestLocalFixtureServiceRejectsPathTraversal(t *testing.T) {
	svc := &LocalFixtureService{}
	if _, err := svc.GetContent(context.Background(), "mock-pocket-vibe", "../secret.txt"); err == nil {
		t.Fatal("expected path traversal to fail")
	}
}
