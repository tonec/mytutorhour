import { toFieldErrorState } from '@/utils/db-errors';
import { toFormState } from '@/utils/form';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudentDetail } from '@/services/db/student/mappers';
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
  await user.click(screen.getByRole('combobox', { name: 'Family' }));
  await user.click(await screen.findByRole('option', { name: label }));
}

async function next(user: UserEvent) {
  await user.click(screen.getByTestId('wizard-next'));
}

const progress = () => screen.getByTestId('wizard-progress');

// Goes through every step, ending on Notes with the Save button showing.
async function fillChild(user: UserEvent) {
  await user.type(screen.getByLabelText('First name'), 'Emily');
  await next(user);
  await chooseFamily(user, 'Taylor (Sarah Taylor)');
  await next(user);
  await user.type(screen.getByLabelText('Subject'), 'Maths');
  await user.type(screen.getByLabelText('Level'), 'GCSE');
  await next(user);
  await user.type(screen.getByLabelText('Notes (only you can see these)'), 'Working on fractions');
}

const emily: StudentDetail = {
  id: '3a2b1c0d-9e8f-4a7b-8c6d-5e4f3a2b1c0d',
  type: 'child',
  firstName: 'Emily',
  familyId: TAYLOR_ID,
  subject: 'Maths',
  level: 'GCSE',
  notes: 'Working on fractions',
  tagIds: [],
  contact: { source: 'family', name: 'Sarah Taylor', isEmpty: true },
};

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

  it('splits the form into four steps, starting with the name', () => {
    // Arrange & Act
    render(<StudentForm families={families} />);

    // Assert
    expect(progress()).toHaveTextContent('Step 1 of 4');
    for (const title of ['Name', 'Family', 'Subject, level, board', 'Notes']) {
      expect(screen.getByRole('navigation', { name: 'Form steps' })).toHaveTextContent(title);
    }
    expect(screen.getByLabelText('First name')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Save student' })).not.toBeInTheDocument();
  });

  it('shows a last name only while Adult is selected', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StudentForm families={families} />);
    await user.type(screen.getByLabelText('First name'), 'Daniel');

    // Act
    await user.click(screen.getByRole('radio', { name: 'Adult' }));
    const shownForAdult = screen.queryByLabelText('Last name') !== null;
    await user.click(screen.getByRole('radio', { name: 'Child' }));

    // Assert
    expect(shownForAdult).toBe(true);
    expect(screen.queryByLabelText('Last name')).not.toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveValue('Daniel');
  });

  it('requires an adult’s last name before moving on', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StudentForm families={families} />);
    await user.click(screen.getByRole('radio', { name: 'Adult' }));
    await user.type(screen.getByLabelText('First name'), 'Daniel');

    // Act
    await next(user);

    // Assert
    expect(await screen.findByText('Enter a last name.')).toBeInTheDocument();
    expect(progress()).toHaveTextContent('Step 1 of 4');
  });

  it('saves an adult with their last name and no family', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(saveStudent).mockResolvedValue(toFormState('SUCCESS', 'Saved.'));
    render(<StudentForm families={families} />);
    await user.click(screen.getByRole('radio', { name: 'Adult' }));
    await user.type(screen.getByLabelText('First name'), 'Daniel');
    await user.type(screen.getByLabelText('Last name'), 'Hughes');
    await next(user);
    await next(user);
    await user.type(screen.getByLabelText('Subject'), 'French');
    await user.type(screen.getByLabelText('Level'), 'A level');
    await next(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Save student' }));

    // Assert
    await waitFor(() => expect(saveStudent).toHaveBeenCalledOnce());
    const formData = vi.mocked(saveStudent).mock.calls[0][1];
    expect(formData.get('type')).toBe('adult');
    expect(formData.get('lastName')).toBe('Hughes');
  });

  it('shows a saved adult’s last name', () => {
    // Arrange & Act
    render(
      <StudentForm
        student={{ ...emily, type: 'adult', firstName: 'Daniel', lastName: 'Hughes' }}
        families={families}
      />
    );

    // Assert
    expect(screen.getByLabelText('Last name')).toHaveValue('Hughes');
  });

  it('requires a family for a child before moving on', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StudentForm families={families} />);
    await user.type(screen.getByLabelText('First name'), 'Emily');
    await next(user);

    // Act
    await next(user);

    // Assert
    expect(await screen.findByText('Choose or add a family.')).toBeInTheDocument();
    expect(progress()).toHaveTextContent('Step 2 of 4');
    expect(saveStudent).not.toHaveBeenCalled();
  });

  it('shows the family’s contact details once a family is chosen', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StudentForm families={families} />);
    await user.type(screen.getByLabelText('First name'), 'Emily');
    await next(user);

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
    await user.type(screen.getByLabelText('First name'), 'Emily');
    await next(user);

    // Act
    await user.click(screen.getByRole('combobox', { name: 'Family' }));
    await user.click(await screen.findByTestId('family-picker-add-new'));
    const dialog = await screen.findByTestId('family-dialog');
    await user.type(within(dialog).getByLabelText('Family name'), 'Hughes');
    await user.type(within(dialog).getByLabelText('Contact name'), 'Jo Hughes');
    await user.click(within(dialog).getByRole('button', { name: 'Add family' }));

    // Assert
    await waitFor(() => expect(screen.queryByTestId('family-dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Family' })).toHaveValue('Hughes (Jo Hughes)');
    expect(saveFamily).toHaveBeenCalledTimes(1);
  });

  it('shows the notes character count', () => {
    // Arrange & Act
    render(<StudentForm families={families} />);

    // Assert
    expect(screen.getByText('0/2000')).toBeInTheDocument();
  });

  it('calls onSaved instead of navigating when saved from the dialog', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSaved = vi.fn();
    vi.mocked(saveStudent).mockResolvedValue(toFormState('SUCCESS', 'Student added.'));
    render(<StudentForm families={families} intent="dialog" onSaved={onSaved} />);
    await fillChild(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Save student' }));

    // Assert
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    const formData = vi.mocked(saveStudent).mock.calls[0][1];
    expect(formData.get('intent')).toBe('dialog');
  });

  it('cancels with a button instead of a link when onCancel is given', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<StudentForm families={families} onCancel={onCancel} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole('link', { name: 'Cancel' })).not.toBeInTheDocument();
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
    expect(progress()).toHaveTextContent('Step 1 of 4');
    expect(screen.getByLabelText('First name')).toHaveAccessibleDescription(message);
    await waitFor(() => expect(screen.getByLabelText('First name')).toHaveFocus());
  });

  it('lets a saved student jump to any step and save from it', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(saveStudent).mockResolvedValue(toFormState('SUCCESS', 'Saved.'));
    render(<StudentForm student={emily} families={families} />);

    // Act
    await user.click(within(screen.getByTestId('wizard-step-notes')).getByRole('button'));
    const jumpedTo = progress().textContent;
    const headingFocused =
      screen.getByRole('heading', { name: 'Notes' }) === document.activeElement;
    await user.click(within(screen.getByTestId('wizard-step-name')).getByRole('button'));
    await user.click(screen.getByRole('button', { name: 'Save student' }));

    // Assert
    expect(jumpedTo).toBe('Step 4 of 4');
    expect(headingFocused).toBe(true);
    expect(progress()).toHaveTextContent('Step 1 of 4');
    await waitFor(() => expect(saveStudent).toHaveBeenCalledOnce());
  });
});
