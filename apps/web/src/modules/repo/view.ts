import type { RepoBandProps } from "../../shared/ui";
import { renderProjectSummary } from "../project/view";

export function renderRepoBand(props: RepoBandProps): string {
  const { repo, hasReader } = props;

  return `
    <section class="workspace-band" aria-label="Repository">
      ${renderProjectSummary({ repo })}
      <button class="primary-action" data-action="open-repo">${hasReader ? "Reload mock repo" : "Choose mock repo"}</button>
    </section>
  `;
}
