import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Button } from "./Button";
import { cx } from "./utils";

export interface IconButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "children"> {
  icon: ReactNode;
  label: string;
}

export function IconButton({ className, icon, label, ...props }: IconButtonProps) {
  return (
    <Button aria-label={label} title={label} className={cx("pv-icon-button", className)} {...props}>
      {icon}
    </Button>
  );
}
