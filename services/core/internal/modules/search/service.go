package search

import (
	"context"
	"strings"

	filemod "pocket-vibe-v3/services/core/internal/modules/file"
	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
)

type SearchService interface {
	Search(ctx context.Context, projectID string, query string) (*contract.SearchResponse, error)
}

type FixtureSearchService struct {
	Files filemod.Service
}

func (s *FixtureSearchService) Search(ctx context.Context, projectID string, query string) (*contract.SearchResponse, error) {
	if strings.TrimSpace(projectID) == "" {
		projectID = fixture.DefaultProject().Repo.ID
	}
	q := strings.TrimSpace(strings.ToLower(query))
	if q == "" {
		q = "context"
	}

	tree, err := s.Files.ListTree(ctx, projectID)
	if err != nil {
		return nil, err
	}

	results := make([]contract.SearchResult, 0)
	for _, path := range flattenFiles(tree) {
		content, err := s.Files.GetContent(ctx, projectID, path)
		if err != nil {
			return nil, err
		}
		for _, line := range content.Lines {
			if strings.Contains(strings.ToLower(line.Text), q) {
				results = append(results, contract.SearchResult{
					FilePath: content.FilePath,
					Line:     line.Number,
					Preview:  strings.TrimSpace(line.Text),
					Range: contract.SourceRange{
						FilePath:  content.FilePath,
						StartLine: line.Number,
						EndLine:   line.Number,
					},
				})
			}
		}
	}

	return &contract.SearchResponse{Query: q, Results: results}, nil
}

func flattenFiles(nodes []contract.FileNode) []string {
	result := make([]string, 0)
	for _, node := range nodes {
		if node.Kind == "file" {
			result = append(result, node.Path)
			continue
		}
		result = append(result, flattenFiles(node.Children)...)
	}
	return result
}
