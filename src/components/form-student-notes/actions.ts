'use server';

import { routes } from '@/config/routes';
import { caughtErrorToState, dbErrorToState, formPayload } from '@/utils/action-errors';
import { type ActionState, toFormState } from '@/utils/form';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { studentNotesSchema } from './schema';

const FIELDS = ['id', 'notes'] as const;

// Saves only the notes, so the rest of the student (and the duplicate-name check in
// save_student) is untouched. Notes are never logged: errors report the code only (FR-015).
export async function saveStudentNotes(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const payload = formPayload(formData, FIELDS);

  try {
    const { id, notes } = studentNotesSchema.parse(payload);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('students')
      .update({ notes: notes ?? null })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    // No row back means it's missing or another tutor's.
    if (error || !data) return dbErrorToState(error ?? { code: 'P0002' }, 'saveStudentNotes');
  } catch (error) {
    return caughtErrorToState(error, 'saveStudentNotes', payload);
  }

  revalidatePath(routes.students.url, 'layout');
  return toFormState('SUCCESS', 'Notes saved.', payload);
}
