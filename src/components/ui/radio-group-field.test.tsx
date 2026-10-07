import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroupField } from './radio-group-field';
import { FormHarness, errorState } from './test-utils/form-harness';

const options = [
  { value: 'child', label: 'Child' },
  { value: 'adult', label: 'Adult' },
];

describe('RadioGroupField', () => {
  it('labels the group and each option', () => {
    // Arrange & Act
    render(
      <FormHarness defaultValues={{ type: 'child' }}>
        <RadioGroupField name="type" label="Student type" options={options} />
      </FormHarness>
    );

    // Assert
    expect(screen.getByRole('radiogroup', { name: 'Student type' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Child' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Adult' })).not.toBeChecked();
  });

  it('submits the selected value', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FormHarness defaultValues={{ type: 'child' }} onSubmit={onSubmit}>
        <RadioGroupField name="type" label="Student type" options={options} />
      </FormHarness>
    );

    // Act
    await user.click(screen.getByRole('radio', { name: 'Adult' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(screen.getByRole('radio', { name: 'Adult' })).toBeChecked();
    expect((onSubmit.mock.calls[0][0] as FormData).get('type')).toBe('adult');
  });

  it('keeps the current value when onRequestChange returns false', async () => {
    // Arrange
    const user = userEvent.setup();
    const onRequestChange = vi.fn(() => false);
    render(
      <FormHarness defaultValues={{ type: 'adult' }}>
        <RadioGroupField
          name="type"
          label="Student type"
          options={options}
          onRequestChange={onRequestChange}
        />
      </FormHarness>
    );

    // Act
    await user.click(screen.getByRole('radio', { name: 'Child' }));

    // Assert
    expect(onRequestChange).toHaveBeenCalledWith('child');
    expect(screen.getByRole('radio', { name: 'Adult' })).toBeChecked();
  });

  it('renders a server error linked to the group', () => {
    // Arrange & Act
    render(
      <FormHarness defaultValues={{ type: '' }} actionState={errorState('type', 'Choose a type.')}>
        <RadioGroupField name="type" label="Student type" options={options} />
      </FormHarness>
    );

    // Assert
    const group = screen.getByRole('radiogroup', { name: 'Student type' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAccessibleDescription('Choose a type.');
  });
});
