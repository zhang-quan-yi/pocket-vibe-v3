import { escapeHTML } from "../../shared/utils/escape-html";
import type { Repo } from "../../shared/schema";

export function renderProjectSummary(repo: Repo | null): string {
  return `
    <div>
      <h2>Project</h2>
      <p>${escapeHTML(repo?.description ?? "Choose a mock repo to start the shortest engineering path.")}</p>
    </div>
  `;
}
