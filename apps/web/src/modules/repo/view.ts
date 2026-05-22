import type { Repo } from "../../shared/schema";
import { renderProjectSummary } from "../project/view";

export function renderRepoBand(activeRepo: Repo | null, hasReader: boolean): string {
  return `
    <section class="workspace-band" aria-label="Repository">
      ${renderProjectSummary(activeRepo)}
      <button class="primary-action" data-action="open-repo">${hasReader ? "Reload mock repo" : "Choose mock repo"}</button>
    </section>
  `;
}
