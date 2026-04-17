import type { CtaEvent } from '../types/landing';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  }
}

type CtaAnalyticsPayload = {
  event: 'cta_click';
  event_name: 'cta_click';
  event_category: 'engagement';
  event_action: 'click';
  event_label: string;
  cta_label: string;
  cta_location: string;
  cta_href: string;
  cta_id?: string;
  page_title: string;
  page_path: string;
  page_location: string;
  timestamp: number;
};

function buildPayload(event: CtaEvent): CtaAnalyticsPayload {
  const pageLocation = window.location.href;
  const pagePath = `${window.location.pathname}${window.location.search}`;

  return {
    event: 'cta_click',
    event_name: 'cta_click',
    event_category: 'engagement',
    event_action: 'click',
    event_label: event.label,
    cta_label: event.label,
    cta_location: event.location,
    cta_href: event.href,
    cta_id: event.id,
    page_title: document.title,
    page_path: pagePath,
    page_location: pageLocation,
    timestamp: event.timestamp,
  };
}

export function trackCtaClick(event: CtaEvent): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = buildPayload(event);

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', {
      event_category: payload.event_category,
      event_action: payload.event_action,
      event_label: payload.event_label,
      cta_label: payload.cta_label,
      cta_location: payload.cta_location,
      cta_href: payload.cta_href,
      cta_id: payload.cta_id,
      page_path: payload.page_path,
      page_location: payload.page_location,
      page_title: payload.page_title,
      timestamp: payload.timestamp,
    });
  }
}
