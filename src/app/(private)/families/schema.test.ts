import { describe, expect, it } from 'vitest';
import { familySchema } from './schema';

const family = { name: 'Taylor', contactName: 'Sarah Taylor' };

function firstMessage(result: ReturnType<typeof familySchema.safeParse>, path: string) {
  return result.error?.issues.find((issue) => issue.path.join('.') === path)?.message;
}

describe('familySchema', () => {
  it('accepts a family with only a name and contact name', () => {
    // Arrange & Act
    const result = familySchema.safeParse({ ...family, contactEmail: '', contactPhone: '' });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject(family);
    expect(result.data?.contactEmail).toBeUndefined();
    expect(result.data?.contactPhone).toBeUndefined();
  });

  it('accepts contact details', () => {
    // Arrange
    const input = {
      ...family,
      contactEmail: 'sarah.taylor@example.test',
      contactPhone: '07700 900123',
    };

    // Act
    const result = familySchema.safeParse(input);

    // Assert
    expect(result.data).toMatchObject(input);
  });

  it.each([
    ['name', 'Enter a family name.'],
    ['contactName', 'Enter a contact name.'],
  ])('requires %s', (field, message) => {
    // Arrange
    const input = { ...family, [field]: ' ' };

    // Act
    const result = familySchema.safeParse(input);

    // Assert
    expect(firstMessage(result, field)).toBe(message);
  });

  it('limits the family name to 60 characters', () => {
    // Arrange
    const input = { ...family, name: 'a'.repeat(61) };

    // Act
    const result = familySchema.safeParse(input);

    // Assert
    expect(firstMessage(result, 'name')).toBe('Must be 60 characters or fewer.');
  });

  it('rejects an invalid contact email and phone', () => {
    // Arrange
    const input = { ...family, contactEmail: 'sarah@', contactPhone: 'phone' };

    // Act
    const result = familySchema.safeParse(input);

    // Assert
    expect(firstMessage(result, 'contactEmail')).toBe('Please enter a valid email address.');
    expect(firstMessage(result, 'contactPhone')).toBe('Enter a valid phone number.');
  });

  it.each([
    ['inline', 'inline'],
    ['', undefined],
    [undefined, undefined],
  ])('reads intent %j as %j', (intent, expected) => {
    // Arrange & Act
    const result = familySchema.safeParse({ ...family, intent });

    // Assert
    expect(result.data?.intent).toBe(expected);
  });
});
