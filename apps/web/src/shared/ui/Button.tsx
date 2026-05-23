import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<typeof BaseButton>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function Button({
  className,
  variant = "secondary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      type={type}
      className={cx("pv-button", `pv-button--${variant}`, `pv-button--${size}`, className)}
      {...props}
    />
  );
}
