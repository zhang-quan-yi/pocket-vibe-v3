// Package repo 负责仓库的导入、克隆、元数据查询和删除。
// 后端拥有仓库的全生命周期：校验 URL、排队克隆任务、维护仓库元数据、清理仓库存储。
// MVP 阶段仅支持公共 GitHub 仓库的 mock 列表，不支持私有仓库、GitHub 登录或本地目录导入。
package repo

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// RepoService 定义仓库模块对外暴露的能力。
// 后端拥有仓库的全生命周期：校验 URL、排队克隆任务、维护仓库元数据、清理仓库存储。
type RepoService interface {
	// ListRepos 返回当前工作空间下可用的仓库列表。
	// MVP 阶段返回 mock 仓库，后续切片将支持真实仓库导入。
	ListRepos(ctx context.Context) ([]contract.Repo, error)
}

// MockRepoService 是 RepoService 的 mock 实现，服务于 walking skeleton 验证阶段。
// 返回硬编码的 mock 仓库数据，模拟用户已导入的仓库。
type MockRepoService struct{}

// mockRepo 是 walking skeleton 阶段的 mock 仓库数据。
var mockRepo = contract.Repo{
	ID:              "mock-pocket-vibe",
	Name:            "pocket-vibe-mock",
	Description:     "A tiny source-reading fixture for the Read -> Ask -> Save skeleton.",
	RecommendedFile: "src/reader/context.ts",
}

// ListRepos 返回 mock 仓库列表。
func (s *MockRepoService) ListRepos(ctx context.Context) ([]contract.Repo, error) {
	return []contract.Repo{mockRepo}, nil
}
