import { type Page } from '@playwright/test';
import { seedFamily, seedStudent } from './fixtures/seed';
import { expect, test } from './fixtures/tutor';

const DUPLICATE_NAME =
  "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'.";

async function chooseFamily(page: Page, option: string) {
  await page.getByRole('combobox', { name: 'Family' }).click();
  await page.getByRole('option', { name: option }).click();
}

async function next(page: Page) {
  await page.getByTestId('wizard-next').click();
}

// Clicks a step in the wizard's progress indicator.
async function openStep(page: Page, step: 'name' | 'family' | 'study' | 'notes') {
  await page.getByTestId(`wizard-step-${step}`).getByRole('button').click();
}

// Fills the subject step and moves on to Notes.
async function fillStudy(page: Page, subject = 'Maths', level = 'GCSE') {
  await page.getByLabel('Subject', { exact: true }).fill(subject);
  await page.getByLabel('Level', { exact: true }).fill(level);
  await next(page);
}

// Goes through every step of a new child, ending on Notes with Save showing.
async function fillChild(page: Page, firstName: string, family: string) {
  await page.getByLabel('First name').fill(firstName);
  await next(page);
  await chooseFamily(page, family);
  await next(page);
  await fillStudy(page);
}

test.describe('US1 add a child', () => {
  test('adds a child and creates their family from the student form (AC1)', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students/new');

    // Act
    await page.getByLabel('First name').fill('Emily');
    await next(page);
    await page.getByRole('combobox', { name: 'Family' }).click();
    await page.getByTestId('family-picker-add-new').click();
    const dialog = page.getByTestId('family-dialog');
    await dialog.getByLabel('Family name').fill('Taylor');
    await dialog.getByLabel('Contact name').fill('Sarah Taylor');
    await dialog.getByLabel('Contact email (optional)').fill('sarah.taylor@example.test');
    await dialog.getByLabel('Contact phone (optional)').fill('07700 900123');
    await dialog.getByRole('button', { name: 'Add family' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('combobox', { name: 'Family' })).toHaveValue(
      'Taylor (Sarah Taylor)'
    );
    await next(page);
    await fillStudy(page);
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(page).toHaveURL('/students');
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await expect(row).toContainText('Taylor');
    await expect(row.getByTestId('student-type-badge')).toHaveText('Child');

    await row.getByRole('link', { name: 'Emily' }).click();
    await openStep(page, 'family');
    const contact = page.getByTestId('contact-details');
    await expect(contact).toContainText('Sarah Taylor');
    await expect(contact).toContainText('sarah.taylor@example.test');
    await expect(contact).toContainText('07700 900123');
  });

  test('a child has no adult-only fields and needs a family (AC2)', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students/new');
    await expect(page.getByRole('radio', { name: 'Child' })).toBeChecked();

    // Act
    await page.getByLabel('First name').fill('Emily');
    await next(page);
    await next(page);

    // Assert
    await expect(page.getByTestId('wizard-progress')).toHaveText('Step 2 of 4');
    await expect(page.getByLabel(/Last name/)).toHaveCount(0);
    await expect(page.getByLabel(/^Email/)).toHaveCount(0);
    await expect(page.getByLabel(/^Phone/)).toHaveCount(0);
    await expect(page.getByText('Choose or add a family.')).toBeVisible();
    await expect(page).toHaveURL('/students/new');
  });

  test('a second child in an existing family shares its contact (AC3)', async ({
    tutor,
    adminClient,
  }) => {
    // Arrange
    const { page } = tutor;
    await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
      contactEmail: 'sarah.taylor@example.test',
      contactPhone: '07700 900123',
    });
    await page.goto('/students/new');

    // Act
    await fillChild(page, 'Oliver', 'Taylor (Sarah Taylor)');
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(page).toHaveURL('/students');
    await page
      .getByTestId('student-row')
      .filter({ hasText: 'Oliver' })
      .getByRole('link', { name: 'Oliver' })
      .click();
    await openStep(page, 'family');
    await expect(page.getByTestId('contact-details')).toContainText('sarah.taylor@example.test');
  });

  test('a child shows the family’s latest contact details (AC4)', async ({
    tutor,
    adminClient,
  }) => {
    // Arrange
    const { page } = tutor;
    const familyId = await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
      contactEmail: 'sarah.taylor@example.test',
    });
    const studentId = await seedStudent(adminClient, tutor.id, {
      type: 'child',
      firstName: 'Emily',
      familyId,
      subject: 'Maths',
      level: 'GCSE',
    });
    await page.goto(`/students/${studentId}`);
    await openStep(page, 'family');
    await expect(page.getByTestId('contact-details')).toContainText('sarah.taylor@example.test');

    // Act
    await adminClient
      .from('families')
      .update({ contact_email: 'sarah@taylor-family.example.test' })
      .eq('id', familyId);
    await page.reload();
    await openStep(page, 'family');

    // Assert
    await expect(page.getByTestId('contact-details')).toContainText(
      'sarah@taylor-family.example.test'
    );
  });

  test('blocks a duplicate name in the same family (AC5)', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const familyId = await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
    });
    await seedStudent(adminClient, tutor.id, {
      type: 'child',
      firstName: 'Emily',
      familyId,
      subject: 'Maths',
      level: 'GCSE',
    });
    await page.goto('/students/new');

    // Act
    await fillChild(page, 'emily', 'Taylor (Sarah Taylor)');
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert: back on the Name step with the error
    const firstName = page.getByLabel('First name');
    await expect(page.getByText(DUPLICATE_NAME)).toBeVisible();
    await expect(page.getByTestId('wizard-progress')).toHaveText('Step 1 of 4');
    await expect(firstName).toBeFocused();

    await firstName.fill('Emily T');
    await openStep(page, 'notes');
    await page.getByRole('button', { name: 'Save student' }).click();
    await expect(page).toHaveURL('/students');
    await expect(page.getByTestId('student-row').filter({ hasText: 'Emily T' })).toBeVisible();
  });

  test('keeps the form when saving fails to reach the server (FR-017)', async ({
    tutor,
    adminClient,
  }) => {
    // Arrange
    const { page } = tutor;
    await seedFamily(adminClient, tutor.id, { name: 'Taylor', contactName: 'Sarah Taylor' });
    await page.goto('/students/new');
    await fillChild(page, 'Emily', 'Taylor (Sarah Taylor)');
    await page.getByLabel('Notes (only you can see these)').fill('Working on fractions');
    const failSaves = (route: Parameters<Parameters<Page['route']>[1]>[0]) =>
      route.request().method() === 'POST' ? route.abort('internetdisconnected') : route.continue();
    await page.route('**/students/new', failSaves);

    // Act
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: "We couldn't reach the server. Check your connection and try again." })
    ).toBeVisible();
    await expect(page.getByTestId('wizard-progress')).toHaveText('Step 4 of 4');
    await expect(page.getByLabel('Notes (only you can see these)')).toHaveValue(
      'Working on fractions'
    );
    await openStep(page, 'name');
    await expect(page.getByLabel('First name')).toHaveValue('Emily');
    await openStep(page, 'family');
    await expect(page.getByRole('combobox', { name: 'Family' })).toHaveValue(
      'Taylor (Sarah Taylor)'
    );
    await openStep(page, 'study');
    await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('Maths');
    await expect(page.getByLabel('Level', { exact: true })).toHaveValue('GCSE');

    await page.unroute('**/students/new', failSaves);
    await openStep(page, 'notes');
    await page.getByRole('button', { name: 'Save student' }).click();
    await expect(page).toHaveURL('/students');
    await expect(page.getByTestId('student-row').filter({ hasText: 'Emily' })).toBeVisible();
  });

  test('the add-student page fits the viewport without horizontal scrolling', async ({ tutor }) => {
    // Arrange & Act
    const { page } = tutor;
    await page.goto('/students/new');
    await expect(page.getByTestId('student-form')).toBeVisible();

    // Assert
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('student list actions', () => {
  async function seedEmily(tutor: { id: string }, adminClient: Parameters<typeof seedFamily>[0]) {
    const familyId = await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
    });
    return seedStudent(adminClient, tutor.id, {
      type: 'child',
      firstName: 'Emily',
      familyId,
      subject: 'Maths',
      level: 'GCSE',
    });
  }

  async function openEdit(page: Page) {
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await row.getByTestId('student-actions').click();
    await page.getByRole('menuitem', { name: 'Edit student' }).click();
    return page.getByTestId('edit-student-dialog');
  }

  test('the actions menu opens the student to edit in a dialog', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const studentId = await seedEmily(tutor, adminClient);
    await page.goto('/students');

    // Act
    const dialog = await openEdit(page);

    // Assert
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(`/students?modal=student-edit&data=${studentId}`);
    await expect(dialog.getByLabel('First name')).toHaveValue('Emily');
    await openStep(page, 'notes');
    await expect(dialog.getByTestId('wizard-progress')).toHaveText('Step 4 of 4');
    await expect(dialog.getByLabel('Notes (only you can see these)')).toBeVisible();
  });

  test('saves an edit from the dialog and stays on the list', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const studentId = await seedEmily(tutor, adminClient);
    await page.goto('/students');

    // Act
    const dialog = await openEdit(page);
    await openStep(page, 'study');
    await dialog.getByLabel('Subject', { exact: true }).fill('Physics');
    await dialog.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/students');
    await expect(page.getByTestId('student-row').filter({ hasText: 'Emily' })).toContainText(
      'Physics'
    );
    await expect(page.getByTestId('student-actions').first()).toBeFocused();
    const { data } = await adminClient
      .from('students')
      .select('subject')
      .eq('id', studentId)
      .single();
    expect(data?.subject).toBe('Physics');
  });

  test('a link opens the student to edit in a dialog', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const studentId = await seedEmily(tutor, adminClient);

    // Act
    await page.goto(`/students?modal=student-edit&data=${studentId}`);

    // Assert
    const dialog = page.getByTestId('edit-student-dialog');
    await expect(dialog.getByRole('heading', { name: 'Edit Emily' })).toBeVisible();
    await expect(dialog.getByLabel('First name')).toHaveValue('Emily');
  });

  test('a link to an unknown student says it can’t be loaded', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;

    // Act
    await page.goto('/students?modal=student-edit&data=00000000-0000-4000-8000-000000000000');

    // Assert
    const dialog = page.getByTestId('edit-student-dialog');
    await expect(dialog.getByRole('alert')).toHaveText(
      'This student couldn’t be loaded. Please try again.'
    );
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/students');
  });

  test('shows a child’s family contact and offers to copy it', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const familyId = await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
      contactEmail: 'sarah.taylor@example.test',
    });
    await seedStudent(adminClient, tutor.id, {
      type: 'child',
      firstName: 'Emily',
      familyId,
      subject: 'Maths',
      level: 'GCSE',
    });
    await page.goto('/students');

    // Act
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await row.getByTestId('student-contact').click();

    // Assert
    await expect(
      page.getByRole('menuitem', { name: 'sarah.taylor@example.test Copy' })
    ).toBeVisible();
    await expect(page.getByRole('menuitem', { name: '07700 900123 Copy phone' })).toHaveCount(0);
  });

  test('offers to copy an adult’s own email and phone', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    await seedStudent(adminClient, tutor.id, {
      type: 'adult',
      firstName: 'James',
      lastName: 'Wilson',
      subject: 'English',
      level: 'A level',
      email: 'james.wilson@example.test',
      phone: '07700 900456',
    });
    await page.goto('/students');

    // Act
    const row = page.getByTestId('student-row').filter({ hasText: 'James' });
    await row.getByTestId('student-contact').click();

    // Assert
    await expect(
      page.getByRole('menuitem', { name: 'james.wilson@example.test Copy' })
    ).toBeVisible();
    await expect(page.getByRole('menuitem', { name: '07700 900456 Copy' })).toBeVisible();
  });
});

test.describe('student notes from the list', () => {
  async function seedEmily(tutor: { id: string }, adminClient: Parameters<typeof seedFamily>[0]) {
    const familyId = await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
    });
    return seedStudent(adminClient, tutor.id, {
      type: 'child',
      firstName: 'Emily',
      familyId,
      subject: 'Maths',
      level: 'GCSE',
      notes: 'Working on fractions',
    });
  }

  async function openNotes(page: Page) {
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await row.getByTestId('student-actions').click();
    await page.getByRole('menuitem', { name: 'View/edit notes' }).click();
    return page.getByTestId('student-notes-dialog');
  }

  test('notes are not shown as a column in the list', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    await seedEmily(tutor, adminClient);

    // Act
    await page.goto('/students');

    // Assert
    await expect(page.getByTestId('student-row').filter({ hasText: 'Emily' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Notes' })).toHaveCount(0);
    await expect(page.getByText('Working on fractions')).toHaveCount(0);
  });

  test('views and edits a student’s notes in a dialog', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const studentId = await seedEmily(tutor, adminClient);
    await page.goto('/students');

    // Act
    const dialog = await openNotes(page);
    const notes = dialog.getByLabel('Notes (only you can see these)');
    await expect(notes).toHaveValue('Working on fractions');
    await notes.fill('Fractions done, start on algebra');
    await dialog.getByRole('button', { name: 'Save notes' }).click();

    // Assert
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('student-actions').first()).toBeFocused();
    const reopened = await openNotes(page);
    await expect(reopened.getByLabel('Notes (only you can see these)')).toHaveValue(
      'Fractions done, start on algebra'
    );
    const { data } = await adminClient
      .from('students')
      .select('notes, subject')
      .eq('id', studentId)
      .single();
    expect(data).toEqual({ notes: 'Fractions done, start on algebra', subject: 'Maths' });
  });

  test('cancelling discards unsaved notes', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    await seedEmily(tutor, adminClient);
    await page.goto('/students');

    // Act
    const dialog = await openNotes(page);
    await dialog.getByLabel('Notes (only you can see these)').fill('Not saved');
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // Assert
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/students');
    const reopened = await openNotes(page);
    await expect(reopened.getByLabel('Notes (only you can see these)')).toHaveValue(
      'Working on fractions'
    );
  });

  test('a link opens a student’s notes in a dialog', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const studentId = await seedEmily(tutor, adminClient);

    // Act
    await page.goto(`/students?modal=student-notes&data=${studentId}`);

    // Assert
    const dialog = page.getByTestId('student-notes-dialog');
    await expect(dialog.getByLabel('Notes (only you can see these)')).toHaveValue(
      'Working on fractions'
    );
  });
});

test.describe('add a student from the list', () => {
  test('adds a child and their family in a dialog without leaving the list', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students');

    // Act
    await page.getByTestId('add-student-button').click();
    const dialog = page.getByTestId('add-student-dialog');
    await expect(dialog.getByTestId('wizard-progress')).toHaveText('Step 1 of 4');
    await expect(dialog.getByTestId('wizard-step-family').getByRole('button')).toHaveCount(0);
    await dialog.getByLabel('First name').fill('Emily');
    await next(page);
    await dialog.getByRole('combobox', { name: 'Family' }).click();
    await page.getByTestId('family-picker-add-new').click();
    const familyDialog = page.getByTestId('family-dialog');
    await familyDialog.getByLabel('Family name').fill('Taylor');
    await familyDialog.getByLabel('Contact name').fill('Sarah Taylor');
    await familyDialog.getByRole('button', { name: 'Add family' }).click();
    await expect(familyDialog).toBeHidden();
    await next(page);
    await fillStudy(page);
    await dialog.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/students');
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await expect(row).toContainText('Taylor');
    await expect(row.getByTestId('student-type-badge')).toHaveText('Child');
  });

  test('cancelling closes the dialog, saves nothing and returns focus', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students');
    const addButton = page.getByTestId('add-student-button');

    // Act
    await addButton.click();
    const dialog = page.getByTestId('add-student-dialog');
    await expect(page).toHaveURL('/students?modal=student-add');
    await dialog.getByLabel('First name').fill('Not saved');
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // Assert
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/students');
    await expect(addButton).toBeFocused();
    await expect(page.getByTestId('student-row').filter({ hasText: 'Not saved' })).toHaveCount(0);
    await addButton.click();
    await expect(dialog.getByLabel('First name')).toHaveValue('');
  });

  test('Back closes the dialog', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students');
    await page.getByTestId('add-student-button').click();
    const dialog = page.getByTestId('add-student-dialog');
    await expect(dialog).toBeVisible();

    // Act
    await page.goBack();

    // Assert
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL('/students');
  });
});

test('the add-student dialog fits a phone screen without horizontal scrolling', async ({
  tutor,
}) => {
  // Arrange
  const { page } = tutor;
  await page.goto('/students');

  // Act
  await page.getByTestId('add-student-button').click();
  const dialog = page.getByTestId('add-student-dialog');
  await expect(dialog.getByTestId('wizard')).toBeVisible();

  // Assert
  const overflow = await dialog.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe('US2 add an adult', () => {
  test('an adult has a last name and needs no family', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students/new');

    // Act
    await page.getByRole('radio', { name: 'Adult' }).click();
    await page.getByLabel('First name').fill('Daniel');
    await page.getByLabel('Last name').fill('Hughes');
    await next(page);
    await next(page);
    await fillStudy(page, 'French', 'A level');
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(page).toHaveURL('/students');
    const row = page.getByTestId('student-row').filter({ hasText: 'Daniel' });
    await expect(row.getByTestId('student-type-badge')).toHaveText('Adult');
    await row.getByRole('link', { name: 'Daniel' }).click();
    await expect(page.getByLabel('Last name')).toHaveValue('Hughes');
  });

  test('switching to child removes the last name field', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students/new');
    await page.getByRole('radio', { name: 'Adult' }).click();
    await expect(page.getByLabel('Last name')).toBeVisible();

    // Act
    await page.getByRole('radio', { name: 'Child' }).click();

    // Assert
    await expect(page.getByLabel('Last name')).toHaveCount(0);
  });
});
