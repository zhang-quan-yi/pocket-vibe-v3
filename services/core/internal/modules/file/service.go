package file

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

type Service interface {
	ListTree(ctx context.Context, projectID string) ([]contract.FileNode, error)
	GetContent(ctx context.Context, projectID string, filePath string) (*contract.FileContent, error)
}

type LocalFixtureService struct{}

func (s *LocalFixtureService) ListTree(ctx context.Context, projectID string) ([]contract.FileNode, error) {
	project, ok := fixture.ResolveProject(projectID)
	if !ok {
		return nil, serviceerrors.ErrProjectNotFound
	}
	return readTree(project.Root, "")
}

func (s *LocalFixtureService) GetContent(ctx context.Context, projectID string, filePath string) (*contract.FileContent, error) {
	project, ok := fixture.ResolveProject(projectID)
	if !ok {
		return nil, serviceerrors.ErrProjectNotFound
	}

	resolvedPath, normalizedPath, err := resolveProjectPath(project.Root, filePath)
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(resolvedPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, serviceerrors.ErrFileNotFound
		}
		return nil, err
	}

	lines := splitLines(string(data))
	hash := sha256.Sum256(data)

	return &contract.FileContent{
		ProjectID:   projectID,
		FilePath:    normalizedPath,
		Language:    guessLanguage(normalizedPath),
		Size:        int64(len(data)),
		LineCount:   len(lines),
		ContentHash: hex.EncodeToString(hash[:]),
		Lines:       toCodeLines(lines),
		Readable:    true,
	}, nil
}

func readTree(root string, relative string) ([]contract.FileNode, error) {
	dir := root
	if relative != "" {
		dir = filepath.Join(root, relative)
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	nodes := make([]contract.FileNode, 0, len(entries))
	for _, entry := range entries {
		name := entry.Name()
		if strings.HasPrefix(name, ".") {
			continue
		}
		nodePath := filepath.ToSlash(filepath.Join(relative, name))
		if entry.IsDir() {
			children, err := readTree(root, nodePath)
			if err != nil {
				return nil, err
			}
			nodes = append(nodes, contract.FileNode{Name: name, Path: nodePath, Kind: "directory", Children: children})
			continue
		}
		info, err := entry.Info()
		if err != nil {
			return nil, err
		}
		nodes = append(nodes, contract.FileNode{Name: name, Path: nodePath, Kind: "file", Size: info.Size()})
	}

	sort.Slice(nodes, func(i, j int) bool {
		if nodes[i].Kind != nodes[j].Kind {
			return nodes[i].Kind == "directory"
		}
		return nodes[i].Path < nodes[j].Path
	})
	return nodes, nil
}

func resolveProjectPath(root string, filePath string) (string, string, error) {
	cleaned := filepath.Clean(strings.TrimSpace(filePath))
	if cleaned == "." || cleaned == "" || filepath.IsAbs(cleaned) {
		return "", "", serviceerrors.ErrInvalidFilePath
	}

	resolved := filepath.Join(root, cleaned)
	rel, err := filepath.Rel(root, resolved)
	if err != nil {
		return "", "", fmt.Errorf("resolve path: %w", err)
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", "", serviceerrors.ErrInvalidFilePath
	}

	evaluatedRoot, err := filepath.EvalSymlinks(root)
	if err != nil {
		return "", "", fmt.Errorf("resolve root symlink: %w", err)
	}

	evaluatedResolved, err := filepath.EvalSymlinks(resolved)
	if err == nil {
		evaluatedRel, relErr := filepath.Rel(evaluatedRoot, evaluatedResolved)
		if relErr != nil {
			return "", "", fmt.Errorf("resolve evaluated path: %w", relErr)
		}
		if evaluatedRel == ".." || strings.HasPrefix(evaluatedRel, ".."+string(filepath.Separator)) {
			return "", "", serviceerrors.ErrInvalidFilePath
		}
	} else if !os.IsNotExist(err) {
		return "", "", fmt.Errorf("resolve file symlink: %w", err)
	}

	return resolved, filepath.ToSlash(rel), nil
}

func splitLines(content string) []string {
	normalized := strings.ReplaceAll(content, "\r\n", "\n")
	if normalized == "" {
		return []string{}
	}
	parts := strings.Split(normalized, "\n")
	if len(parts) > 0 && parts[len(parts)-1] == "" {
		parts = parts[:len(parts)-1]
	}
	return parts
}

func toCodeLines(lines []string) []contract.CodeLine {
	result := make([]contract.CodeLine, len(lines))
	for i, line := range lines {
		result[i] = contract.CodeLine{Number: i + 1, Text: line}
	}
	return result
}

func guessLanguage(filePath string) string {
	switch strings.ToLower(filepath.Ext(filePath)) {
	case ".ts":
		return "typescript"
	case ".tsx":
		return "tsx"
	case ".js":
		return "javascript"
	case ".go":
		return "go"
	case ".md":
		return "markdown"
	default:
		return "text"
	}
}
