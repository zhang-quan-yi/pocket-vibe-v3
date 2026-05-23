import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

import { Button, type ButtonVariant } from "./Button";
import { cx } from "./utils";

export interface DialogProps {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  triggerVariant?: ButtonVariant;
  size?: "sm" | "md";
}

export function Dialog({
  triggerLabel,
  title,
  description,
  children,
  footer,
  triggerVariant = "secondary",
  size = "md",
}: DialogProps) {
  return (
    <BaseDialog.Root>
      <BaseDialog.Trigger className={cx("pv-button", `pv-button--${triggerVariant}`, "pv-button--md")}>
        {triggerLabel}
      </BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="pv-dialog-backdrop" />
        <BaseDialog.Popup className={cx("pv-dialog-popup", `pv-dialog-popup--${size}`)}>
          <div className="pv-dialog__head">
            <div>
              <BaseDialog.Title className="pv-dialog__title">{title}</BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="pv-dialog__description">{description}</BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close className="pv-dialog__close" aria-label="Close dialog">
              Close
            </BaseDialog.Close>
          </div>
          <div className="pv-dialog__body">{children}</div>
          {footer ? <div className="pv-dialog__footer">{footer}</div> : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function DialogCloseButton({ children = "Done" }: { children?: ReactNode }) {
  return (
    <BaseDialog.Close render={<Button variant="primary" />}>
      {children}
    </BaseDialog.Close>
  );
}
