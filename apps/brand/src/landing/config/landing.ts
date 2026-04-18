const DEFAULT_SITE_URL = 'https://wellink.co.kr';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function ensureValue(value: string | undefined, fallback: string): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value.trim();
}

export function getLandingConfig() {
  const siteUrl = trimTrailingSlash(
    ensureValue(import.meta.env.VITE_SITE_URL, DEFAULT_SITE_URL),
  );

  return {
    siteUrl,
    contactUrl: ensureValue(import.meta.env.VITE_CONTACT_URL, `${siteUrl}/contact`),
    termsUrl: ensureValue(import.meta.env.VITE_TERMS_URL, `${siteUrl}/terms`),
    privacyUrl: ensureValue(import.meta.env.VITE_PRIVACY_URL, `${siteUrl}/privacy`),
    inquiryUrl: ensureValue(import.meta.env.VITE_INQUIRY_URL, `${siteUrl}/contact`),
  };
}
