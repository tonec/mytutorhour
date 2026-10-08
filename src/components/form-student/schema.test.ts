import { describe, expect, it } from 'vitest';
import { studentFormDataToInput, studentSchema } from './schema';

const FAMILY_ID = '6f1c2a9e-4b7d-4c1a-9f3e-2d5b8a7c9e10';
const TAG_ONE = '0a8b7c6d-1e2f-4a3b-8c4d-5e6f7a8b9c0d';
const TAG_TWO = '1b9c8d7e-2f3a-4b4c-9d5e-6f7a8b9c0d1e';

const child = {
  type: 'child',
  firstName: 'Emily',
  familyId: FAMILY_ID,
  subject: 'Maths',
  level: 'GCSE',
};

const adult = {
  type: 'adult',
  firstName: 'Daniel',
  lastName: 'Hughes',
  subject: 'French',
  level: 'A level',
};

function firstMessage(result: ReturnType<typeof studentSchema.safeParse>, path: string) {
  return result.error?.issues.find((issue) => issue.path.join('.') === path)?.message;
}

describe('studentSchema', () => {
  describe('child', () => {
    it('accepts a child with a first name, subject, level and family', () => {
      // Arrange & Act
      const result = studentSchema.safeParse(child);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({ ...child, tagIds: [] });
    });

    it.each(['', undefined])('requires a family (%j)', (familyId) => {
      // Arrange
      const input = { ...child, familyId };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, 'familyId')).toBe('Choose or add a family.');
    });

    it('drops a last name, email and phone sent for a child', () => {
      // Arrange
      const input = {
        ...child,
        lastName: 'Taylor',
        email: 'e@example.test',
        phone: '07700 900123',
      };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('lastName');
      expect(result.data).not.toHaveProperty('email');
      expect(result.data).not.toHaveProperty('phone');
    });
  });

  describe('adult', () => {
    it('accepts an adult with their own contact details and no family', () => {
      // Arrange
      const input = { ...adult, email: 'daniel.hughes@example.test', phone: '+44 7700 900456' };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(input);
      expect(result.data?.familyId).toBeUndefined();
    });

    it.each(['', '   ', undefined])('requires a last name (%j)', (lastName) => {
      // Arrange
      const input = { ...adult, lastName };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, 'lastName')).toBe('Enter a last name.');
    });

    it('rejects an invalid email', () => {
      // Arrange
      const input = { ...adult, email: 'dan@' };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, 'email')).toBe('Please enter a valid email address.');
    });

    it('rejects an invalid phone number', () => {
      // Arrange
      const input = { ...adult, phone: '12345' };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, 'phone')).toBe('Enter a valid phone number.');
    });

    it('turns empty optional fields into undefined', () => {
      // Arrange
      const input = { ...adult, email: '', phone: '', familyId: '', examBoard: '', notes: '' };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        email: undefined,
        phone: undefined,
        familyId: undefined,
        examBoard: undefined,
        notes: undefined,
      });
    });
  });

  describe('shared fields', () => {
    it.each([
      ['firstName', 'Enter a first name.'],
      ['subject', 'Enter a subject.'],
      ['level', 'Enter a level.'],
    ])('requires %s', (field, message) => {
      // Arrange
      const input = { ...child, [field]: '  ' };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, field)).toBe(message);
    });

    it('limits the first name to 50 characters', () => {
      // Arrange
      const input = { ...child, firstName: 'a'.repeat(51) };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, 'firstName')).toBe('Must be 50 characters or fewer.');
    });

    it('accepts notes of 2,000 characters and rejects 2,001', () => {
      // Arrange
      const atLimit = { ...child, notes: 'a'.repeat(2000) };
      const overLimit = { ...child, notes: 'a'.repeat(2001) };

      // Act
      const accepted = studentSchema.safeParse(atLimit);
      const rejected = studentSchema.safeParse(overLimit);

      // Assert
      expect(accepted.success).toBe(true);
      expect(firstMessage(rejected, 'notes')).toBe('Must be 2,000 characters or fewer.');
    });

    it('requires a type', () => {
      // Arrange
      const input = { ...child, type: '' };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(firstMessage(result, 'type')).toBe('Choose adult or child.');
    });

    it.each([
      ['dialog', 'dialog'],
      ['', undefined],
    ])('reads an intent of %j as %j', (intent, expected) => {
      // Arrange
      const input = { ...child, intent };

      // Act
      const result = studentSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.intent).toBe(expected);
    });
  });
});

describe('studentFormDataToInput', () => {
  it('reads text fields and every tag id', () => {
    // Arrange
    const formData = new FormData();
    formData.set('type', 'child');
    formData.set('firstName', 'Emily');
    formData.set('familyId', FAMILY_ID);
    formData.set('subject', 'Maths');
    formData.set('level', 'GCSE');
    formData.append('tagIds', TAG_ONE);
    formData.append('tagIds', TAG_TWO);

    // Act
    const input = studentFormDataToInput(formData);

    // Assert
    expect(input).toEqual({ ...child, tagIds: [TAG_ONE, TAG_TWO] });
    expect(studentSchema.parse(input).tagIds).toEqual([TAG_ONE, TAG_TWO]);
  });

  it('leaves out fields the form did not send', () => {
    // Arrange
    const formData = new FormData();
    formData.set('type', 'child');

    // Act
    const input = studentFormDataToInput(formData);

    // Assert
    expect(input).toEqual({ type: 'child', tagIds: [] });
  });
});
