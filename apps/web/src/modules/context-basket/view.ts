import { escapeHTML } from "../../shared/utils/escape-html";
import type { ContextBasketPanelProps } from "../../shared/ui";

export function renderContextPanel(props: ContextBasketPanelProps): string {
  const { chips: contextChips, resolvedContext, canAddContext } = props;
  const chips = contextChips
    .map(
      (chip) => `
        <button class="context-chip" data-action="remove-chip" data-chip-id="${escapeHTML(chip.id)}">
          <span class="chip-kind">${escapeHTML(chip.kind)}</span>
          <span class="chip-label">${escapeHTML(chip.label)}</span>
        </button>
      `,
    )
    .join("");

  const resolved = resolvedContext
    ? `<p class="meta">Estimated ${resolvedContext.estimatedToken} tokens. ${escapeHTML(resolvedContext.warnings.join(" "))}</p>`
    : `<p class="meta">Select lines and add context before asking.</p>`;

  return `
    <section class="panel context-panel" aria-label="Context basket">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Add context</p>
          <h2>Context Basket</h2>
        </div>
        <button class="secondary-action" data-action="add-context" ${canAddContext ? "" : "disabled"}>Add</button>
      </div>
      <div class="chip-row">${chips || `<span class="muted">No context yet.</span>`}</div>
      ${resolved}
    </section>
  `;
}
