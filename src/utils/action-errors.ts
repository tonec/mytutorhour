import 'server-only';
import { mapDbError, toFieldErrorState } from '@/utils/db-errors';
import { type ActionState, fromErrorToFormState, toFormState } from '@/utils/form';
import { ZodError } from 'zod';
import { notFound, unstable_rethrow } from 'next/navigation';

const SAVE_FAILED = "We couldn't save this. Please try again.";

type Payload = Record<string, string>;

// Turns a database error into the form's error state. A missing row (or another tutor's,
// hidden by RLS) renders the not-found page instead (FR-026).
export function dbErrorToState(
  error: { code?: string; message?: string } | null,
  action: string,
  payload?: Payload
): ActionState {
  const result = mapDbError(error, action);
  if (result.kind === 'notFound') notFound();
  if (result.kind === 'field') return toFieldErrorState(result.field, result.message, payload);
  return toFormState('ERROR', result.message, payload);
}

// For the catch block of a server action: lets Next.js redirects/notFound through, shows
// validation errors on their fields, and reports anything else without logging any values.
export function caughtErrorToState(error: unknown, action: string, payload?: Payload): ActionState {
  unstable_rethrow(error);
  if (error instanceof ZodError) return fromErrorToFormState(error, payload);

  const code = (error as { code?: unknown } | null)?.code;
  console.error({ action, code: typeof code === 'string' ? code : undefined });
  return toFormState('ERROR', SAVE_FAILED, payload);
}

// The submitted text fields, echoed back so values survive a failed save without JS (FR-017).
export function formPayload(formData: FormData, keys: readonly string[]): Payload {
  const payload: Payload = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') payload[key] = value;
  }
  return payload;
}
