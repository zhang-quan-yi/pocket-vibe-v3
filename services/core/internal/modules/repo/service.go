package repo

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
)

type RepoService interface {
	ListRepos(ctx context.Context) ([]contract.Repo, error)
}

type FixtureRepoService struct{}

func (s *FixtureRepoService) ListRepos(ctx context.Context) ([]contract.Repo, error) {
	projects := fixture.ListProjects()
	repos := make([]contract.Repo, 0, len(projects))
	for _, project := range projects {
		repos = append(repos, project.Repo)
	}
	return repos, nil
}
