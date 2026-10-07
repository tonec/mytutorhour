import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FormHarness, errorState } from './test-utils/form-harness';
import { TextareaField } from './textarea-field';

describe('TextareaField', () => {
  it('associates the label with the textarea', () => {
    // Arrange & Act
    render(
      <FormHarness>
        <TextareaField name="notes" label="Notes (only you can see these)" />
      </FormHarness>
    );

    // Assert
    expect(screen.getByLabelText('Notes (only you can see these)')).toBeInstanceOf(
      HTMLTextAreaElement
    );
  });

  it('shows a live character count when maxLength is set', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <FormHarness defaultValues={{ notes: '' }}>
        <TextareaField name="notes" label="Notes" maxLength={2000} />
      </FormHarness>
    );
    expect(screen.getByText('0/2000')).toBeInTheDocument();

    // Act
    await user.type(screen.getByLabelText('Notes'), 'Hello');

    // Assert
    expect(screen.getByText('5/2000')).toBeInTheDocument();
  });

  it('stops input at the limit', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <FormHarness defaultValues={{ notes: '' }}>
        <TextareaField name="notes" label="Notes" maxLength={5} />
      </FormHarness>
    );

    // Act
    await user.type(screen.getByLabelText('Notes'), 'Too long');

    // Assert
    expect(screen.getByLabelText('Notes')).toHaveValue('Too l');
  });

  it('renders a server error linked to the textarea', () => {
    // Arrange & Act
    render(
      <FormHarness actionState={errorState('notes', 'Notes are too long.')}>
        <TextareaField name="notes" label="Notes" />
      </FormHarness>
    );

    // Assert
    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('Notes are too long.');
  });
});
