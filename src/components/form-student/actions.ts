'use server';

import { routes } from '@/config/routes';
import { caughtErrorToState, dbErrorToState, formPayload } from '@/utils/action-errors';
import { type ActionState, toFormState } from '@/utils/form';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { studentFormDataToInput, studentSchema } from '@/components/form-student/schema';

const FIELDS = [
  'id',
  'type',
  'firstName',
  'lastName',
  'familyId',
  'subject',
  'level',
  'examBoard',
  'notes',
  'email',
  'phone',
  'intent',
] as const;

export async function saveStudent(_state: ActionState, formData: FormData): Promise<ActionState> {
  const payload = formPayload(formData, FIELDS);
  let fromDialog = false;

  try {
    const student = studentSchema.parse(studentFormDataToInput(formData));
    const adult = student.type === 'adult' ? student : undefined;
    const supabase = await createClient();

    // One transaction: the student row plus their tag links (research R2). The function also
    // drops adult-only values for a child and checks for a duplicate name in the family.
    const { error } = await supabase.rpc('save_student', {
      p_id: student.id,
      p_type: student.type,
      p_first_name: student.firstName,
      p_last_name: adult?.lastName,
      p_family_id: student.familyId,
      p_subject: student.subject,
      p_level: student.level,
      p_exam_board: student.examBoard,
      p_notes: student.notes,
      p_email: adult?.email,
      p_phone: adult?.phone,
      p_tag_ids: student.tagIds,
    });

    if (error) return dbErrorToState(error, 'saveStudent', payload);
    fromDialog = student.intent === 'dialog';
  } catch (error) {
    return caughtErrorToState(error, 'saveStudent', payload);
  }

  // The list, the student's page and their family's page all show this student.
  revalidatePath(routes.students.url, 'layout');
  revalidatePath(routes.families.url, 'layout');

  // Added from the list's dialog: the list behind it refreshes, so stay put and let it close.
  if (fromDialog) return toFormState('SUCCESS', 'Student added.');
  redirect(routes.students.url);
}
