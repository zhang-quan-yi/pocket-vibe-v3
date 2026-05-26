package repo

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/authctx"
	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

// RepoService 管理 repo 的发现和元数据查询。
// Phase 1 仅提供 fixture repo 的只读查询；
// 后续 import / delete / task 等写操作将通过独立方法扩展此接口。
type RepoService interface {
	// ListRepos 返回当前用户可见的所有 repo。
	// userID 从 context 中获取；未认证时返回 ErrUnauthorized。
	ListRepos(ctx context.Context) ([]contract.Repo, error)

	// GetRepo 按 projectID 返回单个 repo 元数据。
	// projectID 不存在时返回 serviceerrors.ErrProjectNotFound。
	// userID 从 context 中获取；未认证时返回 ErrUnauthorized。
	GetRepo(ctx context.Context, projectID string) (*contract.Repo, error)
}

// FixtureRepoService 从本地 fixture registry 读取 repo 元数据。
type FixtureRepoService struct{}

func (s *FixtureRepoService) ListRepos(ctx context.Context) ([]contract.Repo, error) {
	if _, ok := authctx.RequireUser(ctx); !ok {
		return nil, serviceerrors.ErrUnauthorized
	}
	projects := fixture.ListProjects()
	repos := make([]contract.Repo, 0, len(projects))
	for _, project := range projects {
		repo := project.Repo
		repo.Source = "fixture"
		repos = append(repos, repo)
	}
	return repos, nil
}

func (s *FixtureRepoService) GetRepo(ctx context.Context, projectID string) (*contract.Repo, error) {
	if _, ok := authctx.RequireUser(ctx); !ok {
		return nil, serviceerrors.ErrUnauthorized
	}
	project, ok := fixture.ResolveProject(projectID)
	if !ok {
		return nil, serviceerrors.ErrProjectNotFound
	}
	repo := project.Repo
	repo.Source = "fixture"
	return &repo, nil
}
