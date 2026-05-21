// Package context 负责将前端 Context Basket 中的芯片解析为可发送给 Agent 的真实上下文。
// 包括芯片校验、Anchor 解析、token 估算、上下文裁剪和发送预览生成。
// #codebase 是 retrieve intent，不是把整个仓库塞进模型上下文。
// 后端拥有上下文解析逻辑，前端只负责芯片的创建、展示和发送前确认。
package context

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// ContextService 定义上下文解析模块对外暴露的能力。
// 后端拥有上下文解析逻辑，前端只负责芯片的创建、展示和发送前确认。
type ContextService interface {
	// Resolve 将前端选中的 ContextChip 数组解析为结构化上下文。
	// 返回解析后的芯片、估算 token 数和警告信息（如芯片缺失、上下文超限等）。
	Resolve(ctx context.Context, chips []contract.ContextChip) (*contract.ResolvedContext, error)
}

// MockContextService 是 ContextService 的 mock 实现，服务于 walking skeleton 验证阶段。
// 使用简单的 token 估算公式：基础 token + 每枚芯片固定 token。
type MockContextService struct{}

// Resolve 解析上下文芯片，估算 token 数并检查警告。
func (s *MockContextService) Resolve(ctx context.Context, chips []contract.ContextChip) (*contract.ResolvedContext, error) {
	warnings := make([]string, 0)
	if len(chips) == 0 {
		warnings = append(warnings, "No context chips were selected.")
	}

	return &contract.ResolvedContext{
		Chips:          chips,
		EstimatedToken: 160 + len(chips)*80,
		Warnings:       warnings,
	}, nil
}
