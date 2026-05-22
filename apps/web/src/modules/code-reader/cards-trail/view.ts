import { escapeHTML } from "../../../shared/utils/escape-html";
import type { Note } from "../../../shared/schema";

export function renderCardsTrailPanel(note: Note | null, canSave: boolean): string {
  const savedNoteMarkup = note
    ? `
      <div class="saved-note">
        <strong>${escapeHTML(note.title)}</strong>
        <p>${escapeHTML(note.body.slice(0, 120))}${note.body.length > 120 ? "..." : ""}</p>
        <button class="secondary-action" data-action="jump-note">Jump back to source</button>
      </div>
    `
    : `<p class="meta">Save appears after the mock answer completes.</p>`;

  return `
    <section class="panel note-panel" aria-label="Save note">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Save</p>
          <h2>Note</h2>
        </div>
        <button class="secondary-action" data-action="save-note" ${canSave ? "" : "disabled"}>Save</button>
      </div>
      ${savedNoteMarkup}
    </section>
  `;
}
