import { toFieldErrorState } from '@/utils/db-errors';
import { type ActionState } from '@/utils/form';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { useActionForm } from '@/hooks/use-action-form';
import { ActionForm } from '@/components/ui/action-form';
import { FormField } from '@/components/ui/form-field';
import { Wizard } from './wizard';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
  city: z.string().trim().min(1, 'Enter a city.'),
  notes: z.string().optional(),
});

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

function TestForm({
  navigation,
  action = vi.fn(),
}: {
  navigation?: 'linear' | 'free';
  action?: Action;
}) {
  const actionForm = useActionForm({
    schema,
    action,
    defaultValues: { name: '', city: '', notes: '' },
  });

  return (
    <ActionForm actionForm={actionForm} aria-label="Test">
      <Wizard
        navigation={navigation}
        submitLabel="Save"
        steps={[
          {
            id: 'about',
            title: 'About',
            fields: ['name'],
            content: <FormField name="name" label="Name" />,
          },
          {
            id: 'place',
            title: 'Place',
            fields: ['city'],
            content: <FormField name="city" label="City" />,
          },
          {
            id: 'notes',
            title: 'Notes',
            fields: ['notes'],
            content: <FormField name="notes" label="Notes" />,
          },
        ]}
      />
    </ActionForm>
  );
}

const stepItem = (id: string) => screen.getByTestId(`wizard-step-${id}`);

describe('Wizard', () => {
  it('shows the first step and the number of steps', () => {
    // Arrange & Act
    render(<TestForm />);

    // Assert
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3');
    expect(stepItem('about')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByLabelText('Name')).toBeVisible();
    expect(screen.getByLabelText('City')).not.toBeVisible();
    expect(screen.queryByTestId('wizard-prev')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('does not move on while the step has an error', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TestForm />);

    // Act
    await user.click(screen.getByTestId('wizard-next'));

    // Assert
    expect(await screen.findByText('Enter a name.')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3');
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('moves forward and back, keeping what was typed', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText('Name'), 'Emily');

    // Act
    await user.click(screen.getByTestId('wizard-next'));
    await user.click(screen.getByTestId('wizard-prev'));

    // Assert
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3');
    expect(screen.getByLabelText('Name')).toHaveValue('Emily');
    expect(screen.getByRole('heading', { name: 'About' })).toHaveFocus();
  });

  it('goes to the next step when Enter is pressed in a field', async () => {
    // Arrange
    const user = userEvent.setup();
    const action = vi.fn();
    render(<TestForm action={action} />);

    // Act
    await user.type(screen.getByLabelText('Name'), 'Emily{Enter}');

    // Assert
    await waitFor(() =>
      expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 2 of 3')
    );
    expect(action).not.toHaveBeenCalled();
  });

  it('only lets a linear wizard jump back to steps already reached', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TestForm />);
    expect(within(stepItem('place')).queryByRole('button')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Name'), 'Emily');
    await user.click(screen.getByTestId('wizard-next'));
    expect(within(stepItem('notes')).queryByRole('button')).not.toBeInTheDocument();

    // Act
    await user.click(within(stepItem('about')).getByRole('button'));

    // Assert
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3');
    expect(within(stepItem('place')).getByRole('button')).toBeInTheDocument();
  });

  it('lets a free wizard jump to any step', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TestForm navigation="free" />);
    await user.type(screen.getByLabelText('Name'), 'Emily');
    await user.click(within(stepItem('place')).getByRole('button'));
    await user.type(screen.getByLabelText('City'), 'Leeds');

    // Act
    await user.click(within(stepItem('about')).getByRole('button'));
    await user.click(within(stepItem('notes')).getByRole('button'));

    // Assert
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 3 of 3');
  });

  it('stops a jump ahead on a passed step that has an error', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TestForm navigation="free" />);
    await user.type(screen.getByLabelText('Name'), 'Emily');

    // Act
    await user.click(within(stepItem('notes')).getByRole('button'));

    // Assert
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 2 of 3');
    expect(await screen.findByText('Enter a city.')).toBeInTheDocument();
  });

  it('goes back to the step with a server error and focuses the field', async () => {
    // Arrange
    const user = userEvent.setup();
    const action = vi
      .fn<Action>()
      .mockResolvedValue(toFieldErrorState('name', 'That name is taken.'));
    render(<TestForm action={action} />);
    await user.type(screen.getByLabelText('Name'), 'Emily');
    await user.click(screen.getByTestId('wizard-next'));
    await user.type(screen.getByLabelText('City'), 'Leeds');
    await user.click(screen.getByTestId('wizard-next'));

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(await screen.findByText('That name is taken.')).toBeVisible();
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3');
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveFocus());
  });
});
