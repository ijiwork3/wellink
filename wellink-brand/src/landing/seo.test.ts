import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('SEO metadata', () => {
  it('contains required html metadata tags', () => {
    const html = readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');

    expect(html).toContain('<html lang="ko">');
    expect(html).toContain('<title>웰링크 | 피트니스·웰니스 브랜드 마케팅 솔루션</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="theme-color"');
  });
});
