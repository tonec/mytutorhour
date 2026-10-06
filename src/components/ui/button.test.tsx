import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with its accessible name', () => {
    // Arrange & Act
    render(<Button>Approve</Button>);

    // Assert
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Approve</Button>);

    // Act
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    // Assert
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Approve
      </Button>
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
