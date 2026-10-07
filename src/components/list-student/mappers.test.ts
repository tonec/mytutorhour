import { describe, expect, it } from 'vitest';
import { type StudentRow, toStudentDetail, toStudentListItem } from './mappers';

const taylor = {
  id: 'f0b7a1c2-3d4e-4f5a-8b6c-7d8e9f0a1b2c',
  name: 'Taylor',
  contact_name: 'Sarah Taylor',
  contact_email: 'sarah.taylor@example.test',
  contact_phone: '07700 900123',
};

function childRow(overrides: Partial<StudentRow> = {}): StudentRow {
  return {
    id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    tutor_id: '9f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a',
    type: 'child',
    first_name: 'Emily',
    last_name: null,
    family_id: taylor.id,
    subject: 'Maths',
    level: 'GCSE',
    exam_board: 'AQA',
    notes: 'Working on fractions',
    email: null,
    phone: null,
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z',
    families: taylor,
    student_tags: [
      { tags: { id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', name: 'Year 11' } },
      { tags: { id: 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a', name: 'Online' } },
    ],
    ...overrides,
  };
}

describe('toStudentListItem', () => {
  it('shows a child by first name with their family and tags', () => {
    // Arrange
    const row = childRow();

    // Act
    const item = toStudentListItem(row);

    // Assert
    expect(item).toEqual({
      id: row.id,
      type: 'child',
      displayName: 'Emily',
      familyId: taylor.id,
      familyName: 'Taylor',
      subject: 'Maths',
      level: 'GCSE',
      tags: [
        { id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', name: 'Year 11' },
        { id: 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a', name: 'Online' },
      ],
    });
  });
});

describe('toStudentDetail', () => {
  it('takes a child’s contact details from their family', () => {
    // Arrange
    const row = childRow();

    // Act
    const detail = toStudentDetail(row);

    // Assert
    expect(detail.contact).toEqual({
      source: 'family',
      name: 'Sarah Taylor',
      email: 'sarah.taylor@example.test',
      phone: '07700 900123',
      isEmpty: false,
    });
    expect(detail).toMatchObject({
      id: row.id,
      type: 'child',
      firstName: 'Emily',
      familyId: taylor.id,
      familyName: 'Taylor',
      subject: 'Maths',
      level: 'GCSE',
      examBoard: 'AQA',
      notes: 'Working on fractions',
      tagIds: ['c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a'],
    });
  });

  it('marks the contact as empty when the family has no email or phone', () => {
    // Arrange
    const row = childRow({ families: { ...taylor, contact_email: null, contact_phone: null } });

    // Act
    const detail = toStudentDetail(row);

    // Assert
    expect(detail.contact).toEqual({
      source: 'family',
      name: 'Sarah Taylor',
      email: undefined,
      phone: undefined,
      isEmpty: true,
    });
  });

  it('turns empty optional fields into undefined', () => {
    // Arrange
    const row = childRow({ exam_board: null, notes: null, student_tags: [] });

    // Act
    const detail = toStudentDetail(row);

    // Assert
    expect(detail.examBoard).toBeUndefined();
    expect(detail.notes).toBeUndefined();
    expect(detail.tagIds).toEqual([]);
  });
});
