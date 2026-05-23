import type { HTMLAttributes } from "react";

import { cx } from "./utils";

export type StatusTone = "ready" | "running" | "warning" | "danger" | "neutral" | "context" | "anchor";

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
}

export function StatusPill({ className, tone = "neutral", ...props }: StatusPillProps) {
  return <span className={cx("pv-status-pill", `pv-status-pill--${tone}`, className)} {...props} />;
}
