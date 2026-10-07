import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWatch } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { FormField } from './form-field';
import { FormHarness, hydrateWithTypedValue } from './test-utils/form-harness';

function WatchedValue({ name }: { name: string }) {
  const value = useWatch({ name }) as string;
  return <output aria-label="Watched value">{value}</output>;
}

describe('FormField', () => {
  it('keeps text typed before hydration', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const ui = (
      <FormHarness defaultValues={{ firstName: '' }} onSubmit={onSubmit}>
        <FormField name="firstName" label="First name" />
      </FormHarness>
    );

    // Act
    hydrateWithTypedValue(ui, 'firstName', 'Emily');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(screen.getByLabelText('First name')).toHaveValue('Emily');
    expect((onSubmit.mock.calls[0][0] as FormData).get('firstName')).toBe('Emily');
  });

  it('hydrates an untouched input to its default value', () => {
    // Arrange
    const ui = (
      <FormHarness defaultValues={{ firstName: 'Oliver' }}>
        <FormField name="firstName" label="First name" />
      </FormHarness>
    );

    // Act
    hydrateWithTypedValue(ui, 'firstName');

    // Assert
    expect(screen.getByLabelText('First name')).toHaveValue('Oliver');
  });

  it('keeps typing normally after hydration', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <FormHarness defaultValues={{ firstName: '' }}>
        <FormField name="firstName" label="First name" />
      </FormHarness>
    );

    // Act
    await user.type(screen.getByLabelText('First name'), 'Emily');

    // Assert
    expect(screen.getByLabelText('First name')).toHaveValue('Emily');
  });

  it('puts text typed before hydration into the form state that watchers and validation read', async () => {
    // Arrange
    const ui = (
      <FormHarness defaultValues={{ firstName: '' }}>
        <FormField name="firstName" label="First name" />
        <WatchedValue name="firstName" />
      </FormHarness>
    );

    // Act
    hydrateWithTypedValue(ui, 'firstName', 'Emily');

    // Assert
    expect(await screen.findByRole('status', { name: 'Watched value' })).toHaveTextContent('Emily');
  });
});
