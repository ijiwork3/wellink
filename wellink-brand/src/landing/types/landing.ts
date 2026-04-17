export type SectionId = 'service-intro' | 'expert-pool' | 'success-case' | 'consultation';

export type CtaEvent = {
  label: string;
  location: string;
  href: string;
  id?: string;
  timestamp: number;
};

export type NavItem = {
  label: string;
  href: `#${SectionId}`;
};
