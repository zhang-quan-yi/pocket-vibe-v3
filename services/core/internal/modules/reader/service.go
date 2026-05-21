// Package reader 负责聚合代码阅读器所需的全部数据，包括文件内容、符号引用、折叠区间和推荐选区。
// ReaderPayload 是产品核心模型，由后端生成、前端和未来原生端消费，不含 CodeMirror 或 DOM 状态。
// 后端拥有 ReaderPayload 的生成逻辑，前端只消费结构化 DTO。
package reader

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// ReaderService 定义代码阅读器模块对外暴露的能力。
// 后端拥有 ReaderPayload 的生成逻辑，前端只消费结构化 DTO。
type ReaderService interface {
	// GetPayload 根据 projectId 和 filePath 聚合返回 ReaderPayload。
	// 包含文件行内容、符号引用、推荐选区等平台无关信息。
	// 当 filePath 为空时，使用仓库的推荐文件。
	GetPayload(ctx context.Context, projectID string, filePath string) (*contract.ReaderPayload, error)
}

// MockReaderService 是 ReaderService 的 mock 实现，服务于 walking skeleton 验证阶段。
// 返回硬编码的 TypeScript 代码内容和符号引用。
type MockReaderService struct{}

// mockLines 是 walking skeleton 阶段的 mock 源码行数据。
var mockLines = []string{
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

// mockRepoID 是 mock 仓库的项目 ID。
const mockRepoID = "mock-pocket-vibe"

// mockRecommendedFile 是 mock 仓库的推荐文件路径。
const mockRecommendedFile = "src/reader/context.ts"

// GetPayload 返回 mock 代码阅读器载荷。
func (s *MockReaderService) GetPayload(ctx context.Context, projectID string, filePath string) (*contract.ReaderPayload, error) {
	if filePath == "" {
		filePath = mockRecommendedFile
	}

	payload := &contract.ReaderPayload{
		ProjectID: mockRepoID,
		FilePath:  filePath,
		Language:  "typescript",
		Lines:     toCodeLines(mockLines),
		Symbols: []contract.SymbolRef{
			{
				Name:  "buildContextBasket",
				Kind:  "function",
				Range: contract.SourceRange{FilePath: filePath, StartLine: 3, EndLine: 12},
			},
			{
				Name:  "createReaderTrailChip",
				Kind:  "function",
				Range: contract.SourceRange{FilePath: filePath, StartLine: 14, EndLine: 21},
			},
		},
		SuggestedSelection: contract.SourceRange{FilePath: filePath, StartLine: 3, EndLine: 12},
	}

	return payload, nil
}

// toCodeLines 将字符串行切片转换为带行号的 CodeLine 结构体切片。
func toCodeLines(lines []string) []contract.CodeLine {
	result := make([]contract.CodeLine, len(lines))
	for i, line := range lines {
		result[i] = contract.CodeLine{Number: i + 1, Text: line}
	}
	return result
}
