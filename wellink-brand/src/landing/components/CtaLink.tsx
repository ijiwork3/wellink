import React from 'react';
import { trackCtaClick } from '../lib/analytics';

type CtaLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  ctaLabel: string;
  ctaLocation: string;
  ctaId?: string;
};

export function CtaLink({
  href,
  ctaLabel,
  ctaLocation,
  ctaId,
  onClick,
  children,
  ...props
}: CtaLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    trackCtaClick({
      label: ctaLabel,
      location: ctaLocation,
      href,
      id: ctaId,
      timestamp: Date.now(),
    });
    onClick?.(event);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
