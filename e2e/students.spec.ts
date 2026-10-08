import { type Page } from '@playwright/test';
import { seedFamily, seedStudent } from './fixtures/seed';
import { expect, test } from './fixtures/tutor';

const DUPLICATE_NAME =
  "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'.";

async function chooseFamily(page: Page, option: string) {
  await page.getByRole('combobox', { name: 'Family' }).click();
  await page.getByRole('option', { name: option }).click();
}

async function fillChild(page: Page, firstName: string, subject = 'Maths', level = 'GCSE') {
  await page.getByLabel('First name').fill(firstName);
  await page.getByLabel('Subject').fill(subject);
  await page.getByLabel('Level').fill(level);
}

test.describe('US1 add a child', () => {
  test('adds a child and creates their family from the student form (AC1)', async ({ tutor }) => {
    // Arrange
    const { page } = tutor;
    await page.goto('/students/new');

    // Act
    await fillChild(page, 'Emily');
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
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(page).toHaveURL('/students');
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await expect(row).toContainText('Taylor');
    await expect(row.getByTestId('student-type-badge')).toHaveText('Child');

    await row.click();
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
    await fillChild(page, 'Emily');
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
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
    await fillChild(page, 'Oliver');
    await chooseFamily(page, 'Taylor (Sarah Taylor)');
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    await expect(page).toHaveURL('/students');
    await page.getByTestId('student-row').filter({ hasText: 'Oliver' }).click();
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
    await expect(page.getByTestId('contact-details')).toContainText('sarah.taylor@example.test');

    // Act
    await adminClient
      .from('families')
      .update({ contact_email: 'sarah@taylor-family.example.test' })
      .eq('id', familyId);
    await page.reload();

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
    await fillChild(page, 'emily');
    await chooseFamily(page, 'Taylor (Sarah Taylor)');
    await page.getByRole('button', { name: 'Save student' }).click();

    // Assert
    const firstName = page.getByLabel('First name');
    await expect(page.getByText(DUPLICATE_NAME)).toBeVisible();
    await expect(firstName).toBeFocused();

    await firstName.fill('Emily T');
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
    await fillChild(page, 'Emily');
    await chooseFamily(page, 'Taylor (Sarah Taylor)');
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
    await expect(page.getByLabel('First name')).toHaveValue('Emily');
    await expect(page.getByRole('combobox', { name: 'Family' })).toHaveValue(
      'Taylor (Sarah Taylor)'
    );
    await expect(page.getByLabel('Subject')).toHaveValue('Maths');
    await expect(page.getByLabel('Level')).toHaveValue('GCSE');
    await expect(page.getByLabel('Notes (only you can see these)')).toHaveValue(
      'Working on fractions'
    );

    await page.unroute('**/students/new', failSaves);
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
  test('the actions menu opens the student to edit', async ({ tutor, adminClient }) => {
    // Arrange
    const { page } = tutor;
    const familyId = await seedFamily(adminClient, tutor.id, {
      name: 'Taylor',
      contactName: 'Sarah Taylor',
    });
    const studentId = await seedStudent(adminClient, tutor.id, {
      type: 'child',
      firstName: 'Emily',
      familyId,
      subject: 'Maths',
      level: 'GCSE',
    });
    await page.goto('/students');

    // Act
    const row = page.getByTestId('student-row').filter({ hasText: 'Emily' });
    await row.getByTestId('student-actions').click();
    await page.getByRole('menuitem', { name: 'Edit student' }).click();

    // Assert
    await expect(page).toHaveURL(`/students/${studentId}`);
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
    await row.getByTestId('student-actions').click();

    // Assert
    await expect(row).toContainText('sarah.taylor@example.test');
    await expect(page.getByRole('menuitem', { name: 'Copy email' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Copy phone' })).toHaveCount(0);
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
    await row.getByTestId('student-actions').click();

    // Assert
    await expect(page.getByRole('menuitem', { name: 'Copy email' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Copy phone' })).toBeVisible();
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
    const reopened = await openNotes(page);
    await expect(reopened.getByLabel('Notes (only you can see these)')).toHaveValue(
      'Working on fractions'
    );
  });
});
