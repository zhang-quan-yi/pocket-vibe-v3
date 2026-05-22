import { escapeHTML } from "../../shared/utils/escape-html";
import type { ChatPanelProps } from "../../shared/ui";

export function renderChatPanel(props: ChatPanelProps): string {
  const { question, answer, toolLog, isChatRunning, canAsk } = props;
  const toolLogItems = toolLog
    .map((item) => `<li>${escapeHTML(item.name)}: ${escapeHTML(item.summary)}</li>`)
    .join("");

  return `
    <section class="panel chat-panel" aria-label="Ask AI">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Ask</p>
          <h2>Mock Agentic Reading</h2>
        </div>
        <span class="mini-state ${isChatRunning ? "running" : ""}">${isChatRunning ? "Running" : "Idle"}</span>
      </div>
      <textarea data-role="question-input" aria-label="Ask about this code">${escapeHTML(question)}</textarea>
      <button class="primary-action wide" data-action="ask" ${canAsk ? "" : "disabled"}>
        Ask with context
      </button>
      <div class="tool-log">
        <strong>ToolCallLog</strong>
        <ul aria-label="Tool execution log">${toolLogItems || "<li>No tool calls yet.</li>"}</ul>
      </div>
      <article class="answer ${answer ? "" : "empty"}">
        ${answer ? escapeHTML(answer) : "The mock answer will stream here."}
      </article>
    </section>
  `;
}
