// Package knowledge 负责用户知识内容的持久化，包括保存的 AI 回答、源码批注和学习笔记。
// 按照设计文档，知识模块涵盖 SavedAnswer、Annotation、NoteDocument 和 Notebook 四个概念：
//   - SavedAnswer: 保存 AI 回答，附带上下的 Context Basket 芯片和源码引用
//   - Annotation: 对源码行、函数或选区的短批注
//   - NoteDocument: 整理型 Markdown 学习笔记（当前 walking skeleton 中的 Note 对应此概念）
//   - Notebook: 仓库级别的默认容器
//
// 所有知识内容都必须携带 Source Anchor，支持源码跳转回溯。
// 知识模块不允许写回源码仓库或修改用户代码。
package knowledge

import (
	"context"
	"strconv"
	"strings"
	"time"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// KnowledgeService 定义知识模块对外暴露的能力。
// 后端拥有知识内容的 CRUD、Anchor 绑定和源码跳转查询。
// MVP 阶段仅实现 NoteDocument 的创建，后续切片逐步补齐 SavedAnswer、Annotation 和 Notebook。
type KnowledgeService interface {
	// CreateNoteDocument 创建一篇学习笔记，携带源码锚点以支持跳转回溯。
	// 当前 walking skeleton 的 POST /notes 端点内部调用此方法。
	CreateNoteDocument(ctx context.Context, req contract.CreateNoteDocumentRequest) (*contract.NoteDocument, error)

	// TODO(Slice-6): CreateSavedAnswer — 保存 AI 回答，附着源码引用
	// TODO(Slice-6): CreateAnnotation — 创建源码批注
	// TODO(Slice-6): ListNoteDocuments — 按仓库列出学习笔记
	// TODO(Slice-6): GetNoteDocument — 获取单篇学习笔记详情
}

// MockKnowledgeService 是 KnowledgeService 的 mock 实现，服务于 walking skeleton 验证阶段。
// 创建的笔记仅在内存中存在，不进行持久化。
type MockKnowledgeService struct{}

// CreateNoteDocument 创建一篇 mock 学习笔记。
func (s *MockKnowledgeService) CreateNoteDocument(ctx context.Context, req contract.CreateNoteDocumentRequest) (*contract.NoteDocument, error) {
	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = "Context basket explanation"
	}

	note := &contract.NoteDocument{
		ID:        "note_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		Title:     title,
		Body:      req.Body,
		Anchors:   req.Anchors,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	return note, nil
}
