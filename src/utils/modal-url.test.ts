import { describe, expect, it } from 'vitest';
import { modalUrl, readModal } from './modal-url';

describe('readModal', () => {
  it('reads a modal and its data', () => {
    // Arrange
    const params = new URLSearchParams('modal=edit-student&data=abc');

    // Act
    const modal = readModal(params);

    // Assert
    expect(modal).toEqual({ name: 'edit-student', data: 'abc' });
  });

  it('reads a modal without data', () => {
    // Arrange
    const params = new URLSearchParams('modal=add-student');

    // Act
    const modal = readModal(params);

    // Assert
    expect(modal).toEqual({ name: 'add-student', data: undefined });
  });

  it('ignores an unknown modal name', () => {
    // Arrange
    const params = new URLSearchParams('modal=delete-everything&data=abc');

    // Act
    const modal = readModal(params);

    // Assert
    expect(modal).toBeNull();
  });

  it('returns null when there is no modal', () => {
    // Arrange
    const params = new URLSearchParams('sort=name');

    // Act
    const modal = readModal(params);

    // Assert
    expect(modal).toBeNull();
  });
});

describe('modalUrl', () => {
  it('sets the modal and data, keeping other params', () => {
    // Arrange
    const current = new URL('https://example.test/students?sort=name');

    // Act
    const url = modalUrl(current, { name: 'edit-notes-student', data: 'abc' });

    // Assert
    expect(url).toBe('/students?sort=name&modal=edit-notes-student&data=abc');
  });

  it('drops data left over from a previous modal', () => {
    // Arrange
    const current = new URL('https://example.test/students?modal=edit-student&data=abc');

    // Act
    const url = modalUrl(current, { name: 'add-student' });

    // Assert
    expect(url).toBe('/students?modal=add-student');
  });

  it('removes the modal params on close, keeping other params', () => {
    // Arrange
    const current = new URL('https://example.test/students?sort=name&modal=add-student');

    // Act
    const url = modalUrl(current, null);

    // Assert
    expect(url).toBe('/students?sort=name');
  });

  it('leaves a bare path when nothing else is in the query', () => {
    // Arrange
    const current = new URL('https://example.test/students?modal=edit-student&data=abc');

    // Act
    const url = modalUrl(current, null);

    // Assert
    expect(url).toBe('/students');
  });
});
