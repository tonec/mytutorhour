import { toFieldErrorState } from '@/utils/db-errors';
import { toFormState } from '@/utils/form';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NETWORK_ERROR_MESSAGE } from '@/hooks/use-action-form';
import { saveFamily } from '@/components/form-family/actions';
import { saveStudent } from './actions';
import { StudentForm } from './form';

vi.mock('./actions', () => ({ saveStudent: vi.fn() }));
vi.mock('@/components/form-family/actions', () => ({ saveFamily: vi.fn() }));
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const TAYLOR_ID = 'f0b7a1c2-3d4e-4f5a-8b6c-7d8e9f0a1b2c';
const families = [
  {
    id: TAYLOR_ID,
    name: 'Taylor',
    contactName: 'Sarah Taylor',
    contactEmail: 'sarah.taylor@example.test',
    contactPhone: '07700 900123',
    studentCount: 1,
  },
];

async function chooseFamily(user: UserEvent, label: string) {
  await user.click(screen.getByLabelText('Family'));
  await user.click(await screen.findByRole('option', { name: label }));
}

async function fillChild(user: UserEvent) {
  await user.type(screen.getByLabelText('First name'), 'Emily');
  await chooseFamily(user, 'Taylor (Sarah Taylor)');
  await user.type(screen.getByLabelText('Subject'), 'Maths');
  await user.type(screen.getByLabelText('Level'), 'GCSE');
  await user.type(screen.getByLabelText('Notes (only you can see these)'), 'Working on fractions');
}

describe('StudentForm', () => {
  beforeEach(() => {
    vi.mocked(saveStudent).mockReset();
    vi.mocked(saveFamily).mockReset();
  });

  it('defaults to a child and shows no adult-only fields', () => {
    // Arrange & Act
    render(<StudentForm families={families} />);

    // Assert
    expect(screen.getByRole('radio', { name: 'Child' })).toBeChecked();
    expect(screen.queryByLabelText(/Last name/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Email/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Phone/)).not.toBeInTheDocument();
  });

  it('requires a family for a child and does not save without one', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StudentForm families={families} />);
    await user.type(screen.getByLabelText('First name'), 'Emily');
    await user.type(screen.getByLabelText('Subject'), 'Maths');
    await user.type(screen.getByLabelText('Level'), 'GCSE');

    // Act
    await user.click(screen.getByRole('button', { name: 'Save student' }));

    // Assert
    expect(await screen.findByText('Choose or add a family.')).toBeInTheDocument();
    expect(saveStudent).not.toHaveBeenCalled();
  });

  it('shows the family’s contact details once a family is chosen', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StudentForm families={families} />);

    // Act
    await chooseFamily(user, 'Taylor (Sarah Taylor)');

    // Assert
    const contact = screen.getByTestId('contact-details');
    expect(contact).toHaveTextContent('Sarah Taylor');
    expect(contact).toHaveTextContent('sarah.taylor@example.test');
    expect(contact).toHaveTextContent('07700 900123');
  });

  it('adds a family from the dialog and selects it', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(saveFamily).mockResolvedValue(
      toFormState('SUCCESS', 'Family added.', {
        id: '7c6b5a49-3827-4165-9a4b-3c2d1e0f9a8b',
        name: 'Hughes',
        contactName: 'Jo Hughes',
      })
    );
    render(<StudentForm families={families} />);

    // Act
    await user.click(screen.getByLabelText('Family'));
    await user.click(await screen.findByTestId('family-picker-add-new'));
    const dialog = await screen.findByTestId('family-dialog');
    await user.type(within(dialog).getByLabelText('Family name'), 'Hughes');
    await user.type(within(dialog).getByLabelText('Contact name'), 'Jo Hughes');
    await user.click(within(dialog).getByRole('button', { name: 'Add family' }));

    // Assert
    await waitFor(() => expect(screen.queryByTestId('family-dialog')).not.toBeInTheDocument());
    expect(screen.getByLabelText('Family')).toHaveValue('Hughes (Jo Hughes)');
    expect(saveFamily).toHaveBeenCalledTimes(1);
  });

  it('shows the notes character count', () => {
    // Arrange & Act
    render(<StudentForm families={families} />);

    // Assert
    expect(screen.getByText('0/2000')).toBeInTheDocument();
  });

  it('keeps everything typed when the save fails to reach the server', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(saveStudent).mockRejectedValue(new TypeError('Failed to fetch'));
    render(<StudentForm families={families} />);
    await fillChild(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Save student' }));

    // Assert
    expect(await screen.findByText(NETWORK_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveValue('Emily');
    expect(screen.getByLabelText('Subject')).toHaveValue('Maths');
    expect(screen.getByLabelText('Level')).toHaveValue('GCSE');
    expect(screen.getByLabelText('Notes (only you can see these)')).toHaveValue(
      'Working on fractions'
    );
  });

  it('shows a duplicate-name error from the server under First name and focuses it', async () => {
    // Arrange
    const user = userEvent.setup();
    const message =
      "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'.";
    vi.mocked(saveStudent).mockResolvedValue(toFieldErrorState('firstName', message));
    render(<StudentForm families={families} />);
    await fillChild(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Save student' }));

    // Assert
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveAccessibleDescription(message);
    await waitFor(() => expect(screen.getByLabelText('First name')).toHaveFocus());
  });
});
