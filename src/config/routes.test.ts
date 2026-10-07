import { describe, expect, it } from 'vitest';
import { getTitleByUrl } from './routes';

describe('getTitleByUrl', () => {
  it.each([
    ['/students', 'Students'],
    ['/students/new', 'Add student'],
    ['/students/tags', 'Tags'],
    ['/families', 'Families'],
    ['/families/new', 'Add family'],
  ])('returns the exact title for %s', (url, title) => {
    // Arrange & Act
    const result = getTitleByUrl(url);

    // Assert
    expect(result).toBe(title);
  });

  it.each([
    ['/students/3f1c2a9e-0000-4000-8000-000000000001', 'Students'],
    ['/families/3f1c2a9e-0000-4000-8000-000000000002', 'Families'],
  ])('falls back to the section title for %s', (url, title) => {
    // Arrange & Act
    const result = getTitleByUrl(url);

    // Assert
    expect(result).toBe(title);
  });

  it('does not treat a shared prefix as a parent route', () => {
    // Arrange & Act
    const result = getTitleByUrl('/studentsx');

    // Assert
    expect(result).toBeUndefined();
  });

  it('returns undefined for an unknown route', () => {
    // Arrange & Act
    const result = getTitleByUrl('/nowhere');

    // Assert
    expect(result).toBeUndefined();
  });
});
