package capability

import (
	"context"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

type Service interface {
	GetProjectCapabilities(ctx context.Context, projectID string) (*contract.ProjectCapabilities, error)
}

type StaticService struct{}

func (s *StaticService) GetProjectCapabilities(ctx context.Context, projectID string) (*contract.ProjectCapabilities, error) {
	if _, ok := fixture.ResolveProject(projectID); !ok {
		return nil, serviceerrors.ErrProjectNotFound
	}
	return &contract.ProjectCapabilities{
		ProjectID: projectID,
		Repo:      contract.CapabilityAvailable,
		File:      contract.CapabilityAvailable,
		Reader:    contract.CapabilityAvailable,
		Search:    contract.CapabilityAvailable,
		Semantic:  contract.CapabilityPartial,
		Chat:      contract.CapabilityAvailable,
		Knowledge: contract.CapabilityAvailable,
	}, nil
}
