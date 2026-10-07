import { type ActionState, toFormState } from '@/utils/form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ActionForm } from '@/components/ui/action-form';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { NETWORK_ERROR_MESSAGE, useActionForm } from './use-action-form';

const schema = z.object({ firstName: z.string(), subject: z.string() });

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

function TestForm({ action }: { action: Action }) {
  const actionForm = useActionForm({
    schema,
    action,
    defaultValues: { firstName: '', subject: '' },
  });

  return (
    <ActionForm actionForm={actionForm} aria-label="Student">
      <FormField name="firstName" label="First name" />
      <FormField name="subject" label="Subject" />
      <FormMessage actionState={actionForm.actionState} />
      <button type="submit">Save</button>
    </ActionForm>
  );
}

describe('useActionForm', () => {
  it('shows a network error and keeps the typed values when the request fails', async () => {
    // Arrange
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockRejectedValue(new TypeError('Failed to fetch'));
    render(<TestForm action={action} />);
    await user.type(screen.getByLabelText('First name'), 'Emily');
    await user.type(screen.getByLabelText('Subject'), 'Maths');

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(await screen.findByText(NETWORK_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveValue('Emily');
    expect(screen.getByLabelText('Subject')).toHaveValue('Maths');
  });

  it('replaces the network error when a retry succeeds', async () => {
    // Arrange
    const user = userEvent.setup();
    const action = vi
      .fn<Action>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(toFormState('SUCCESS', 'Saved.'));
    render(<TestForm action={action} />);
    await user.type(screen.getByLabelText('First name'), 'Emily');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText(NETWORK_ERROR_MESSAGE);

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
    expect(screen.queryByText(NETWORK_ERROR_MESSAGE)).not.toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('focuses the first field the server rejected', async () => {
    // Arrange
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockResolvedValue({
      status: 'ERROR',
      message: '',
      fieldErrors: { errors: [], properties: { firstName: { errors: ['Already used.'] } } },
      timestamp: Date.now(),
    });
    render(<TestForm action={action} />);
    await user.type(screen.getByLabelText('First name'), 'emily');
    await user.click(screen.getByLabelText('Subject'));

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(await screen.findByText('Already used.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('First name')).toHaveFocus());
  });
});
