import { useId, type TextareaHTMLAttributes } from "react";

import { cx } from "./utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
}

export function Textarea({ label, description, error, className, id, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="pv-field" data-invalid={Boolean(error) || undefined}>
      <label className="pv-field__label" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        className={cx("pv-field__control", "pv-field__textarea", className)}
        aria-invalid={Boolean(error) || props["aria-invalid"]}
        {...props}
      />
      {description ? <p className="pv-field__hint">{description}</p> : null}
      {error ? <p className="pv-field__error">{error}</p> : null}
    </div>
  );
}
