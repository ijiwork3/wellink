import { describe, expect, it, vi } from 'vitest';
import { trackCtaClick } from './analytics';

describe('trackCtaClick', () => {
  it('does nothing when dataLayer is missing', () => {
    window.dataLayer = undefined;
    window.gtag = undefined;

    expect(() =>
      trackCtaClick({
        label: '테스트',
        location: 'unit',
        href: 'https://wellink.co.kr/contact',
        timestamp: 123,
      }),
    ).not.toThrow();
    expect(window.dataLayer).toBeUndefined();
  });

  it('pushes GA4-friendly cta payload when dataLayer exists', () => {
    window.dataLayer = [];
    window.gtag = undefined;

    trackCtaClick({
      label: '상담 신청',
      location: 'hero_primary',
      href: 'https://wellink.co.kr/contact',
      id: 'hero_primary_main',
      timestamp: 123456789,
    });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'cta_click',
      event_name: 'cta_click',
      event_category: 'engagement',
      event_action: 'click',
      event_label: '상담 신청',
      cta_label: '상담 신청',
      cta_location: 'hero_primary',
      cta_href: 'https://wellink.co.kr/contact',
      cta_id: 'hero_primary_main',
      timestamp: 123456789,
    });
    expect(window.dataLayer?.[0]).toMatchObject({
      page_path: expect.any(String),
      page_location: expect.any(String),
      page_title: expect.any(String),
    });
  });

  it('calls gtag when available', () => {
    window.dataLayer = undefined;
    const gtagMock = vi.fn();
    window.gtag = gtagMock;

    trackCtaClick({
      label: '무료 상담 신청',
      location: 'footer_primary',
      href: 'https://wellink.co.kr/contact',
      timestamp: 987654321,
    });

    expect(gtagMock).toHaveBeenCalledTimes(1);
    expect(gtagMock).toHaveBeenCalledWith(
      'event',
      'cta_click',
      expect.objectContaining({
        event_category: 'engagement',
        event_action: 'click',
        event_label: '무료 상담 신청',
        cta_location: 'footer_primary',
        cta_href: 'https://wellink.co.kr/contact',
        timestamp: 987654321,
      }),
    );
  });
});
