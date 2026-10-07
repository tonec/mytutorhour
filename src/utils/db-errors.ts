import { type ActionState } from '@/utils/form';

type DbError = { code?: string; message?: string } | null;

export type DbErrorResult =
  | { kind: 'field'; field: string; message: string }
  | { kind: 'form'; message: string }
  | { kind: 'notFound' };

// Matched against `error.message`, which holds the constraint name both for the errors our
// database functions raise and for the constraint backstops. `error.details` is never read: it
// can contain the conflicting values (student names, notes), which must not reach logs.
const FIELD_ERRORS: { constraint: string; field: string; message: string }[] = [
  {
    constraint: 'students_family_name_unique',
    field: 'firstName',
    message:
      "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'.",
  },
  {
    constraint: 'tags_tutor_name_unique',
    field: 'name',
    message: 'You already have a tag with this name.',
  },
];

export function mapDbError(error: DbError, action: string): DbErrorResult {
  const code = error?.code;
  const message = error?.message ?? '';

  if (code === '23505') {
    const match = FIELD_ERRORS.find(({ constraint }) => message.includes(constraint));
    if (match) {
      return { kind: 'field', field: match.field, message: match.message };
    }
  }

  if (code === '23503') {
    return { kind: 'form', message: "Move or remove this family's students first." };
  }

  if (code === '23514') {
    return { kind: 'form', message: 'Please check the highlighted fields.' };
  }

  if (code === 'P0002') {
    return { kind: 'notFound' };
  }

  // Log only where it happened and the error code: never the payload, row or message.
  console.error({ action, code });
  return { kind: 'form', message: "We couldn't save this. Please try again." };
}

export function toFieldErrorState(
  field: string,
  message: string,
  payload?: Record<string, string>
): ActionState {
  return {
    status: 'ERROR',
    message: '',
    fieldErrors: { errors: [], properties: { [field]: { errors: [message] } } },
    timestamp: Date.now(),
    payload,
  };
}
