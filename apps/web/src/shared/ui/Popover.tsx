import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ReactNode } from "react";

export interface PopoverProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Popover({ trigger, title, description, children }: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger className="pv-button pv-button--secondary pv-button--md">{trigger}</BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={8}>
          <BasePopover.Popup className="pv-popover">
            <BasePopover.Arrow className="pv-popover__arrow">
              <svg width="20" height="10" viewBox="0 0 20 10" aria-hidden="true">
                <path d="M0 10L10 0L20 10Z" />
              </svg>
            </BasePopover.Arrow>
            <BasePopover.Title className="pv-popover__title">{title}</BasePopover.Title>
            {description ? (
              <BasePopover.Description className="pv-popover__description">{description}</BasePopover.Description>
            ) : null}
            <div className="pv-popover__body">{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
