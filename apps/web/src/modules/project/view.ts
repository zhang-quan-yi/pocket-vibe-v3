import { escapeHTML } from "../../shared/utils/escape-html";
import type { ProjectSummaryProps } from "../../shared/ui";

export function renderProjectSummary(props: ProjectSummaryProps): string {
  const { repo } = props;

  return `
    <div>
      <h2>Project</h2>
      <p>${escapeHTML(repo?.description ?? "Choose a mock repo to start the shortest engineering path.")}</p>
    </div>
  `;
}
