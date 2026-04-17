import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders section navigation links with correct anchors', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: '서비스 소개' })).toHaveAttribute(
      'href',
      '#service-intro',
    );
    expect(screen.getByRole('link', { name: '전문가 풀' })).toHaveAttribute('href', '#expert-pool');
    expect(screen.getByRole('link', { name: '성공 사례' })).toHaveAttribute('href', '#success-case');
  });

  it('routes CTA links to configured contact URL', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: '캠페인 상담 받기' })).toHaveAttribute(
      'href',
      'https://wellink.co.kr/contact',
    );
    expect(screen.getByRole('link', { name: '지금 무료 상담 신청하기' })).toHaveAttribute(
      'href',
      'https://wellink.co.kr/contact',
    );
  });

  it('supports mobile menu open and ESC close', () => {
    render(<App />);

    const menuButton = screen.getByRole('button', { name: '모바일 메뉴 열기' });
    fireEvent.click(menuButton);
    expect(screen.getByRole('dialog', { name: '모바일 메뉴' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: '모바일 메뉴' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '모바일 메뉴 열기' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('does not render placeholder links', () => {
    render(<App />);

    const allLinks = screen.getAllByRole('link');
    allLinks.forEach((link) => {
      expect(link.getAttribute('href')).not.toBe('#');
    });
  });
});
