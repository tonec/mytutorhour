import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComboboxField } from './combobox-field';
import { FormHarness } from './test-utils/form-harness';

const families = [
  { value: 'f1', label: 'Taylor (Sarah Taylor)' },
  { value: 'f2', label: 'Smith (Jo Smith)' },
];

describe('ComboboxField', () => {
  it('submits the chosen option in a hidden input', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FormHarness defaultValues={{ familyId: '' }} onSubmit={onSubmit}>
        <ComboboxField name="familyId" label="Family" options={families} />
      </FormHarness>
    );

    // Act
    await user.click(screen.getByLabelText('Family'));
    await user.click(await screen.findByRole('option', { name: 'Taylor (Sarah Taylor)' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect((onSubmit.mock.calls[0][0] as FormData).get('familyId')).toBe('f1');
  });

  it('runs the extra option instead of selecting it', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onSubmit = vi.fn();
    render(
      <FormHarness defaultValues={{ familyId: '' }} onSubmit={onSubmit}>
        <ComboboxField
          name="familyId"
          label="Family"
          options={families}
          extraOption={{ label: 'Add new family…', onSelect }}
        />
      </FormHarness>
    );

    // Act
    await user.click(screen.getByLabelText('Family'));
    await user.click(await screen.findByRole('option', { name: 'Add new family…' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect((onSubmit.mock.calls[0][0] as FormData).get('familyId')).toBeNull();
  });

  it('creates a new option from the typed text and selects it', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCreate = vi.fn(async (text: string) => ({ value: 't9', label: text }));
    const onSubmit = vi.fn();
    render(
      <FormHarness defaultValues={{ tagIds: [] }} onSubmit={onSubmit}>
        <ComboboxField
          name="tagIds"
          label="Tags (optional)"
          options={[{ value: 't1', label: 'Online' }]}
          multiple
          onCreate={onCreate}
        />
      </FormHarness>
    );

    // Act
    await user.type(screen.getByLabelText('Tags (optional)'), 'Exam soon');
    await user.click(await screen.findByRole('option', { name: "Create 'Exam soon'" }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(onCreate).toHaveBeenCalledWith('Exam soon');
    expect((onSubmit.mock.calls[0][0] as FormData).getAll('tagIds')).toEqual(['t9']);
  });

  it('does not offer to create a name that already exists in any case', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <FormHarness defaultValues={{ tagIds: [] }}>
        <ComboboxField
          name="tagIds"
          label="Tags (optional)"
          options={[{ value: 't1', label: 'Online' }]}
          multiple
          onCreate={vi.fn()}
        />
      </FormHarness>
    );

    // Act
    await user.type(screen.getByLabelText('Tags (optional)'), 'online');

    // Assert
    expect(await screen.findByRole('option', { name: 'Online' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: "Create 'online'" })).not.toBeInTheDocument();
  });
});
