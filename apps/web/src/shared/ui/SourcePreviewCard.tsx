import { Button } from "./Button";
import { StatusPill } from "./StatusPill";
import { cx } from "./utils";

export interface SourcePreviewCardProps {
  path: string;
  range: string;
  title: string;
  snippet: string;
  status?: "ready" | "stale" | "saved";
  onPreview?: () => void;
  onJump?: () => void;
}

export function SourcePreviewCard({
  path,
  range,
  title,
  snippet,
  status = "ready",
  onPreview,
  onJump,
}: SourcePreviewCardProps) {
  const statusLabel = status === "stale" ? "Stale anchor" : status === "saved" ? "Saved source" : "Ready source";
  const statusTone = status === "stale" ? "warning" : status === "saved" ? "anchor" : "context";

  return (
    <article className={cx("pv-source-card", status === "stale" && "pv-source-card--stale")}>
      <div className="pv-source-card__head">
        <div>
          <span className="pv-source-card__path">{path}</span>
          <h3>{title}</h3>
        </div>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      </div>
      <pre className="pv-source-card__snippet">
        <code>{snippet}</code>
      </pre>
      <div className="pv-source-card__foot">
        <span>{range}</span>
        <div className="pv-source-card__actions">
          <Button size="sm" variant="secondary" onClick={onPreview}>
            Preview
          </Button>
          <Button size="sm" variant="primary" onClick={onJump}>
            Jump
          </Button>
        </div>
      </div>
    </article>
  );
}
