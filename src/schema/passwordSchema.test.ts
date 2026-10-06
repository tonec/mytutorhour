import { describe, expect, it } from 'vitest';
import { passwordSchema } from './passwordSchema';

describe('passwordSchema', () => {
  it.each([8, 20])('accepts a password of %i characters', (length) => {
    // Arrange
    const password = 'a'.repeat(length);

    // Act
    const result = passwordSchema.safeParse(password);

    // Assert
    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    // Arrange
    const password = 'a'.repeat(7);

    // Act
    const result = passwordSchema.safeParse(password);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Password must be at least 8 characters long.');
  });

  it('rejects a password longer than 20 characters', () => {
    // Arrange
    const password = 'a'.repeat(21);

    // Act
    const result = passwordSchema.safeParse(password);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Password cannot exceed 20 characters.');
  });
});
