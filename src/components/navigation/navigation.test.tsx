import { navigationItems } from '@/config/navigation-items';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Navigation } from './navigation';
import { isPathActive } from './utils';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));

function renderAt(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  render(
    <SidebarProvider>
      <Navigation routes={navigationItems} />
    </SidebarProvider>
  );
}

function currentLinks() {
  return screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page');
}

describe('Navigation', () => {
  it('marks only the link for the current page as current', () => {
    // Arrange & Act
    renderAt('/calendar');

    // Assert
    expect(currentLinks()).toEqual([screen.getByRole('link', { name: 'Calendar' })]);
  });

  it('marks Home as current on the dashboard', () => {
    // Arrange & Act
    renderAt('/dashboard');

    // Assert
    expect(currentLinks()).toEqual([screen.getByRole('link', { name: 'Dashboard' })]);
  });

  it('expands the group and marks the sub-link as current on a nested page', () => {
    // Arrange & Act
    renderAt('/students/abc');

    // Assert
    expect(screen.getByRole('button', { name: /Students & Families/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(currentLinks()).toEqual([screen.getByRole('link', { name: 'Students' })]);
  });

  it('keeps the group collapsed when none of its pages are current', () => {
    // Arrange & Act
    renderAt('/payments');

    // Assert
    expect(screen.queryByRole('link', { name: 'Students' })).not.toBeInTheDocument();
  });

  it('highlights the group trigger when one of its pages is current', () => {
    // Arrange & Act
    renderAt('/students');

    // Assert
    expect(screen.getByRole('button', { name: /Students & Families/ })).toHaveAttribute(
      'data-active'
    );
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute('data-active');
    expect(screen.getByRole('link', { name: 'Families' })).not.toHaveAttribute('data-active');
    expect(currentLinks()).toEqual([screen.getByRole('link', { name: 'Students' })]);
  });

  it('does not highlight the group trigger when opened without a current page', async () => {
    // Arrange
    const user = userEvent.setup();
    renderAt('/payments');
    const trigger = screen.getByRole('button', { name: /Students & Families/ });

    // Act
    await user.click(trigger);

    // Assert
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).not.toHaveAttribute('data-active');
    for (const name of ['Students', 'Families']) {
      const link = screen.getByRole('link', { name });
      expect(link).not.toHaveAttribute('data-active');
      expect(link).not.toHaveAttribute('aria-current');
      // The sub-button's base text colour must be overridden, or every sub-link looks active
      expect(link).toHaveClass('text-muted-foreground');
      expect(link).not.toHaveClass('text-sidebar-foreground');
    }
  });
});

describe('isPathActive', () => {
  it.each([
    ['/students', '/students', true],
    ['/students/abc', '/students', true],
    ['/studentsx', '/students', false],
    ['/families', '/students', false],
  ])('isPathActive(%s, %s) is %s', (pathname, link, expected) => {
    // Arrange & Act
    const result = isPathActive(pathname, link);

    // Assert
    expect(result).toBe(expected);
  });
});
