import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  /** When true, button spans the full width of its container (e.g. form submit). Default false. */
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  ComponentPropsWithoutRef<'button'> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClassName =
  'inline-flex items-center justify-center px-4 py-2.5 font-normal disabled:opacity-60';

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'h-12 bg-primary cursor-pointer text-white hover:bg-primary-hover active:bg-primary-pressed',
  secondary:
    'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50',
};

function buildClassName(
  variant: ButtonVariant,
  fullWidth: boolean,
  className?: string,
) {
  return [
    baseClassName,
    variantClassName[variant],
    fullWidth ? 'flex w-full' : 'w-fit',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;

  const classes = buildClassName(variant, fullWidth, className);

  if ('href' in props && props.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonRest } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
