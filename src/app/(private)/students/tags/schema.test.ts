import { describe, expect, it } from 'vitest';
import { deleteTagSchema, renameTagSchema, tagNameSchema } from './schema';

const TAG_ID = '0a8b7c6d-1e2f-4a3b-8c4d-5e6f7a8b9c0d';

describe('tagNameSchema', () => {
  it('trims and accepts a name of 1 to 30 characters', () => {
    // Arrange & Act
    const result = tagNameSchema.safeParse('  Year 11 ');

    // Assert
    expect(result.data).toBe('Year 11');
  });

  it('accepts exactly 30 characters', () => {
    // Arrange & Act
    const result = tagNameSchema.safeParse('a'.repeat(30));

    // Assert
    expect(result.success).toBe(true);
  });

  it.each([
    ['whitespace only', '   '],
    ['31 characters', 'a'.repeat(31)],
    ['empty', ''],
  ])('rejects %s', (_case, name) => {
    // Arrange & Act
    const result = tagNameSchema.safeParse(name);

    // Assert
    expect(result.error?.issues[0].message).toBe('Tag names must be 1–30 characters.');
  });
});

describe('renameTagSchema', () => {
  it('needs a tag id and a valid name', () => {
    // Arrange & Act
    const valid = renameTagSchema.safeParse({ id: TAG_ID, name: 'Year 11' });
    const invalid = renameTagSchema.safeParse({ id: 'not-a-uuid', name: ' ' });

    // Assert
    expect(valid.success).toBe(true);
    expect(invalid.error?.issues.map((issue) => issue.path[0])).toEqual(['id', 'name']);
  });
});

describe('deleteTagSchema', () => {
  it('needs a tag id', () => {
    // Arrange & Act
    const result = deleteTagSchema.safeParse({ id: TAG_ID });

    // Assert
    expect(result.success).toBe(true);
  });
});
