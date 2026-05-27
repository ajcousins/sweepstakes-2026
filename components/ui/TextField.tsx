import type { ComponentPropsWithoutRef } from 'react';

export type TextFieldProps = {
  label: string;
  id: string;
} & ComponentPropsWithoutRef<'input'>;

const inputClassName =
  'h-12 w-full border border-primary-border px-3 py-2';

const labelClassName = 'mb-2 block text-sm font-normal';

export function TextField({
  label,
  id,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        className={className ? `${inputClassName} ${className}` : inputClassName}
        {...inputProps}
      />
    </div>
  );
}
