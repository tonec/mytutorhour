import { describe, expect, it } from 'vitest';
import { studentNotesSchema } from './schema';

const id = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

describe('studentNotesSchema', () => {
  it('trims the notes', () => {
    // Arrange & Act
    const result = studentNotesSchema.safeParse({ id, notes: '  Working on fractions  ' });

    // Assert
    expect(result.data).toEqual({ id, notes: 'Working on fractions' });
  });

  it('turns blank notes into undefined so they can be cleared', () => {
    // Arrange & Act
    const result = studentNotesSchema.safeParse({ id, notes: '   ' });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.notes).toBeUndefined();
  });

  it('rejects notes over 2,000 characters', () => {
    // Arrange & Act
    const result = studentNotesSchema.safeParse({ id, notes: 'a'.repeat(2001) });

    // Assert
    expect(result.error?.issues[0]?.message).toBe('Must be 2,000 characters or fewer.');
  });

  it('rejects a missing or invalid student id', () => {
    // Arrange & Act
    const result = studentNotesSchema.safeParse({ id: 'not-a-uuid', notes: 'Hello' });

    // Assert
    expect(result.success).toBe(false);
  });
});
