import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('reduced motion preference', () => {
  it('renders static progress bars when prefers-reduced-motion is enabled', async () => {
    vi.resetModules();
    vi.doMock('motion/react', async () => {
      const actual = await vi.importActual<typeof import('motion/react')>('motion/react');
      return {
        ...actual,
        useReducedMotion: () => true,
      };
    });

    const { default: App } = await import('./App');
    const { container } = render(<App />);

    expect(container.querySelector('div[style*="width: 80%"]')).toBeInTheDocument();
    expect(container.querySelector('div[style*="width: 60%"]')).toBeInTheDocument();
    expect(container.querySelector('div[style*="width: 90%"]')).toBeInTheDocument();

    vi.doUnmock('motion/react');
  });
});
