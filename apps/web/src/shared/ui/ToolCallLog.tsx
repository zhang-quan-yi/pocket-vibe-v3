import { StatusPill, type StatusTone } from "./StatusPill";
import { cx } from "./utils";

export type ToolCallStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface ToolCallItem {
  id: string;
  label: string;
  target: string;
  status: ToolCallStatus;
  detail?: string;
}

export interface ToolCallLogProps {
  title?: string;
  items: ToolCallItem[];
  compact?: boolean;
}

const statusMeta: Record<ToolCallStatus, { label: string; tone: StatusTone }> = {
  queued: { label: "Queued", tone: "neutral" },
  running: { label: "Running", tone: "running" },
  completed: { label: "Done", tone: "ready" },
  failed: { label: "Failed", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "warning" },
};

export function ToolCallLog({ title = "ToolCallLog", items, compact = false }: ToolCallLogProps) {
  return (
    <section className={cx("pv-tool-log", compact && "pv-tool-log--compact")} aria-label={title}>
      <div className="pv-tool-log__head">
        <span>{title}</span>
        <StatusPill tone="context">{items.length} steps</StatusPill>
      </div>
      <ol className="pv-tool-log__timeline">
        {items.map((item) => {
          const meta = statusMeta[item.status];

          return (
            <li key={item.id} className="pv-tool-log__item" data-status={item.status}>
              <span className="pv-tool-log__rail" aria-hidden="true" />
              <div className="pv-tool-log__content">
                <div className="pv-tool-log__row">
                  <strong>{item.label}</strong>
                  <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                </div>
                <span className="pv-tool-log__target">{item.target}</span>
                {item.detail && !compact ? <p>{item.detail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
