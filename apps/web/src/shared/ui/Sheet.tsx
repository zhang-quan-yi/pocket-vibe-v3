import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

import { cx } from "./utils";

export interface SheetProps {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  snapLabel?: string;
}

export function Sheet({ triggerLabel, title, description, children, footer, snapLabel = "Half" }: SheetProps) {
  return (
    <BaseDialog.Root modal="trap-focus">
      <BaseDialog.Trigger className="pv-button pv-button--secondary pv-button--md">{triggerLabel}</BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="pv-sheet-backdrop" />
        <BaseDialog.Popup className="pv-sheet">
          <span className="pv-sheet__handle" aria-hidden="true" />
          <span className="pv-sheet__snap">{snapLabel}</span>
          <BaseDialog.Close className="pv-sheet__close" aria-label="Close sheet">
            Close
          </BaseDialog.Close>
          <BaseDialog.Title className="pv-sheet__title">{title}</BaseDialog.Title>
          {description ? (
            <BaseDialog.Description className="pv-sheet__description">{description}</BaseDialog.Description>
          ) : null}
          <div className={cx("pv-sheet__body", footer ? "pv-sheet__body--with-footer" : undefined)}>{children}</div>
          {footer ? <div className="pv-sheet__footer">{footer}</div> : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
