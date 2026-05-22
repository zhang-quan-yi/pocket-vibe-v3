package reader

import (
	"context"
	"regexp"
	"strings"
	"unicode/utf8"

	filemod "pocket-vibe-v3/services/core/internal/modules/file"
	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
)

type ReaderService interface {
	GetPayload(ctx context.Context, projectID string, filePath string) (*contract.ReaderPayload, error)
}

type FixtureReaderService struct {
	Files filemod.Service
}

var functionPattern = regexp.MustCompile(`^\s*(?:export\s+)?function\s+([A-Za-z0-9_]+)`)

func (s *FixtureReaderService) GetPayload(ctx context.Context, projectID string, filePath string) (*contract.ReaderPayload, error) {
	if strings.TrimSpace(projectID) == "" {
		projectID = fixture.DefaultProject().Repo.ID
	}
	if strings.TrimSpace(filePath) == "" {
		filePath = fixture.DefaultProject().Repo.RecommendedFile
	}

	content, err := s.Files.GetContent(ctx, projectID, filePath)
	if err != nil {
		return nil, err
	}

	symbols := extractSymbols(content.FilePath, content.Lines)
	suggested := contract.SourceRange{FilePath: content.FilePath, StartLine: 1, EndLine: max(len(content.Lines), 1)}
	if len(symbols) > 0 {
		suggested = symbols[0].Range
	}

	return &contract.ReaderPayload{
		ProjectID:          content.ProjectID,
		FilePath:           content.FilePath,
		Language:           content.Language,
		Lines:              content.Lines,
		Symbols:            symbols,
		SuggestedSelection: suggested,
	}, nil
}

func extractSymbols(filePath string, lines []contract.CodeLine) []contract.SymbolRef {
	symbols := make([]contract.SymbolRef, 0)
	for i, line := range lines {
		matches := functionPattern.FindStringSubmatch(line.Text)
		if len(matches) != 2 {
			continue
		}
		startLine := i + 1
		endLine := findFunctionEnd(i, lines)
		symbols = append(symbols, contract.SymbolRef{
			Name:  matches[1],
			Kind:  "function",
			Range: contract.SourceRange{FilePath: filePath, StartLine: startLine, EndLine: endLine},
		})
	}
	return symbols
}

func findFunctionEnd(startIdx int, lines []contract.CodeLine) int {
	depth := 0
	seenBrace := false
	for i := startIdx; i < len(lines); i++ {
		text := stripBraceNoise(lines[i].Text)
		depth += strings.Count(text, "{")
		if strings.Contains(text, "{") {
			seenBrace = true
		}
		depth -= strings.Count(text, "}")
		if seenBrace && depth <= 0 {
			return i + 1
		}
	}
	return len(lines)
}

func stripBraceNoise(line string) string {
	line = trimLineComment(line)
	var builder strings.Builder
	builder.Grow(len(line))

	inSingle := false
	inDouble := false
	inTemplate := false
	escaped := false

	for len(line) > 0 {
		r, size := utf8.DecodeRuneInString(line)
		line = line[size:]

		if escaped {
			escaped = false
			continue
		}

		switch r {
		case '\\':
			if inSingle || inDouble || inTemplate {
				escaped = true
			}
		case '\'':
			if !inDouble && !inTemplate {
				inSingle = !inSingle
			}
		case '"':
			if !inSingle && !inTemplate {
				inDouble = !inDouble
			}
		case '`':
			if !inSingle && !inDouble {
				inTemplate = !inTemplate
			}
		default:
			if !inSingle && !inDouble && !inTemplate {
				builder.WriteRune(r)
			}
		}
	}

	return builder.String()
}

func trimLineComment(line string) string {
	inSingle := false
	inDouble := false
	inTemplate := false
	escaped := false

	for i := 0; i < len(line)-1; i++ {
		if escaped {
			escaped = false
			continue
		}

		switch line[i] {
		case '\\':
			if inSingle || inDouble || inTemplate {
				escaped = true
			}
		case '\'':
			if !inDouble && !inTemplate {
				inSingle = !inSingle
			}
		case '"':
			if !inSingle && !inTemplate {
				inDouble = !inDouble
			}
		case '`':
			if !inSingle && !inDouble {
				inTemplate = !inTemplate
			}
		case '/':
			if !inSingle && !inDouble && !inTemplate && line[i+1] == '/' {
				return line[:i]
			}
		}
	}

	return line
}

func max(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
