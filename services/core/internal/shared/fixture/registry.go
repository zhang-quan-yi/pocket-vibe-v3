package fixture

import (
	"path/filepath"
	"runtime"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

type ProjectDescriptor struct {
	Repo contract.Repo
	Root string
}

var mockPocketVibe = ProjectDescriptor{
	Repo: contract.Repo{
		ID:              "mock-pocket-vibe",
		Name:            "pocket-vibe-mock",
		Description:     "A tiny source-reading fixture for the Read -> Ask -> Save skeleton.",
		RecommendedFile: "src/reader/context.ts",
	},
}

func init() {
	_, filename, _, _ := runtime.Caller(0)
	mockPocketVibe.Root = filepath.Clean(filepath.Join(filepath.Dir(filename), "..", "..", "fixtures", "mock-pocket-vibe"))
}

func ListProjects() []ProjectDescriptor {
	return []ProjectDescriptor{mockPocketVibe}
}

func ResolveProject(projectID string) (ProjectDescriptor, bool) {
	for _, project := range ListProjects() {
		if project.Repo.ID == projectID {
			return project, true
		}
	}
	return ProjectDescriptor{}, false
}

func DefaultProject() ProjectDescriptor {
	return mockPocketVibe
}
