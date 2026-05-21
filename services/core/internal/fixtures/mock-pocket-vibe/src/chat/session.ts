import type { ContextChip } from "../reader/types";

export function summarizeContext(chips: ContextChip[]): string {
  if (chips.length === 0) {
    return "No visible context";
  }

  return chips.map((chip) => chip.label).join(", ");
}
