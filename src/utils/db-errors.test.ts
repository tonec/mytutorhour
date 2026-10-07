import { getFieldError } from '@/utils/form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mapDbError, toFieldErrorState } from './db-errors';

describe('mapDbError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a duplicate student name to a first-name field error', () => {
    // Arrange
    const error = { code: '23505', message: 'students_family_name_unique' };

    // Act
    const result = mapDbError(error, 'saveStudent');

    // Assert
    expect(result).toEqual({
      kind: 'field',
      field: 'firstName',
      message:
        "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'.",
    });
  });

  it('maps the backstop index error for duplicate names the same way', () => {
    // Arrange
    const error = {
      code: '23505',
      message: 'duplicate key value violates unique constraint "students_family_name_unique"',
    };

    // Act
    const result = mapDbError(error, 'saveStudent');

    // Assert
    expect(result).toMatchObject({ kind: 'field', field: 'firstName' });
  });

  it('maps a duplicate tag name to a name field error', () => {
    // Arrange
    const error = { code: '23505', message: 'tags_tutor_name_unique' };

    // Act
    const result = mapDbError(error, 'renameTag');

    // Assert
    expect(result).toEqual({
      kind: 'field',
      field: 'name',
      message: 'You already have a tag with this name.',
    });
  });

  it('maps a foreign key violation to the family message', () => {
    // Arrange
    const error = { code: '23503', message: 'update or delete on table "families" violates…' };

    // Act
    const result = mapDbError(error, 'deleteFamily');

    // Assert
    expect(result).toEqual({
      kind: 'form',
      message: "Move or remove this family's students first.",
    });
  });

  it('maps a check violation to a form message', () => {
    // Arrange
    const error = { code: '23514', message: 'students_child_shape' };

    // Act
    const result = mapDbError(error, 'saveStudent');

    // Assert
    expect(result).toEqual({ kind: 'form', message: 'Please check the highlighted fields.' });
  });

  it('maps P0002 to not found', () => {
    // Arrange
    const error = { code: 'P0002', message: 'student_not_found' };

    // Act
    const result = mapDbError(error, 'saveStudent');

    // Assert
    expect(result).toEqual({ kind: 'notFound' });
  });

  it('logs only the action and code for anything else', () => {
    // Arrange
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = { code: '08006', message: 'connection failure for Emily Taylor' };

    // Act
    const result = mapDbError(error, 'saveStudent');

    // Assert
    expect(result).toEqual({ kind: 'form', message: "We couldn't save this. Please try again." });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]).toEqual([{ action: 'saveStudent', code: '08006' }]);
  });

  it('treats an unknown 23505 constraint as an unexpected error', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = { code: '23505', message: 'some_other_unique' };

    // Act
    const result = mapDbError(error, 'saveStudent');

    // Assert
    expect(result).toEqual({ kind: 'form', message: "We couldn't save this. Please try again." });
  });
});

describe('toFieldErrorState', () => {
  it('builds an error state readable by getFieldError', () => {
    // Arrange
    const payload = { firstName: 'emily' };

    // Act
    const state = toFieldErrorState('firstName', 'Already used.', payload);

    // Assert
    expect(state.status).toBe('ERROR');
    expect(getFieldError(state, 'firstName')).toBe('Already used.');
    expect(state.payload).toEqual(payload);
  });
});
