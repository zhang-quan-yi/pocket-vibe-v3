// Package search 负责代码仓库的全文本搜索，包括搜索结果片段、预览和 ContextChip 转换。
// 搜索不能阻塞代码阅读器，查询必须有超时保护。
// 后端拥有搜索的执行逻辑（未来集成 ripgrep），前端只消费搜索结果。
package search

import (
	"context"
	"strings"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// SearchService 定义搜索模块对外暴露的能力。
// 后端拥有搜索的执行逻辑（未来集成 ripgrep），前端只消费搜索结果。
type SearchService interface {
	// Search 在指定仓库内执行全文本搜索，返回匹配结果列表。
	// 结果包含文件路径、行号、预览文本和源码范围。
	// 查询为空时使用默认关键词。
	Search(ctx context.Context, projectID string, query string) (*contract.SearchResponse, error)
}

// MockSearchService 是 SearchService 的 mock 实现，服务于 walking skeleton 验证阶段。
// 在硬编码的 mock 源码行中执行简单的字符串匹配搜索。
type MockSearchService struct{}

// mockSearchLines 是搜索 mock 使用的源码行数据。
var mockSearchLines = []string{
	"import type { ContextChip, SourceRange } from './types';",
	"",
	"export function buildContextBasket(selection: SourceRange): ContextChip[] {",
	"  const baseChip: ContextChip = {",
	"    id: `selection:${selection.filePath}:${selection.startLine}` ,",
	"    kind: 'selection',",
	"    label: `Lines ${selection.startLine}-${selection.endLine}` ,",
	"    source: selection,",
	"  };",
	"",
	"  return [baseChip, createReaderTrailChip(selection.filePath)];",
	"}",
	"",
	"function createReaderTrailChip(filePath: string): ContextChip {",
	"  return {",
	"    id: `trail:${filePath}` ,",
	"    kind: 'readingTrail',",
	"    label: 'Current reading trail',",
	"    source: { filePath, startLine: 1, endLine: 1 },",
	"  };",
	"}",
}

// mockSearchFile 是搜索 mock 使用的文件路径。
const mockSearchFile = "src/reader/context.ts"

// Search 在 mock 源码行中执行简单的字符串匹配搜索。
func (s *MockSearchService) Search(ctx context.Context, projectID string, query string) (*contract.SearchResponse, error) {
	q := strings.TrimSpace(strings.ToLower(query))
	if q == "" {
		q = "context"
	}

	results := make([]contract.SearchResult, 0)
	for i, line := range mockSearchLines {
		if strings.Contains(strings.ToLower(line), q) {
			lineNo := i + 1
			results = append(results, contract.SearchResult{
				FilePath: mockSearchFile,
				Line:     lineNo,
				Preview:  strings.TrimSpace(line),
				Range: contract.SourceRange{
					FilePath:  mockSearchFile,
					StartLine: lineNo,
					EndLine:   lineNo,
				},
			})
		}
	}

	return &contract.SearchResponse{
		Query:   q,
		Results: results,
	}, nil
}
