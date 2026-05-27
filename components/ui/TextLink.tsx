import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

export type TextLinkProps = ComponentPropsWithoutRef<typeof Link>;

const baseClassName = 'font-normal border-b';

export function TextLink({ className, children, ...props }: TextLinkProps) {
  const classes = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <Link className={classes} {...props}>
      {children}
    </Link>
  );
}
