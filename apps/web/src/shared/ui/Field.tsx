import { Field as BaseField } from "@base-ui/react/field";
import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface FieldProps extends Omit<ComponentPropsWithoutRef<typeof BaseField.Control>, "className"> {
  label: string;
  description?: string;
  error?: string;
  className?: string;
}

export function Field({ label, description, error, className, ...controlProps }: FieldProps) {
  return (
    <BaseField.Root className="pv-field" invalid={Boolean(error)}>
      <BaseField.Label className="pv-field__label">{label}</BaseField.Label>
      <BaseField.Control
        className={cx("pv-field__control", className)}
        aria-invalid={Boolean(error) || controlProps["aria-invalid"]}
        {...controlProps}
      />
      {description ? <BaseField.Description className="pv-field__hint">{description}</BaseField.Description> : null}
      {error ? <BaseField.Error className="pv-field__error">{error}</BaseField.Error> : null}
    </BaseField.Root>
  );
}
