import 'server-only';
import { createClient } from '@/lib/supabase/server';
import {
  type StudentDetail,
  type StudentListItem,
  toStudentDetail,
  toStudentListItem,
} from './mappers';

// A student with their family's contact details (children show these) and their tags.
const STUDENT_SELECT =
  '*, families(id, name, contact_name, contact_email, contact_phone), student_tags(tags(id, name))';

// Throws with the error code only, so no student data reaches logs or error pages.
function loadFailed(what: string, code: string | undefined): never {
  throw new Error(`Could not load ${what} (${code ?? 'unknown'}).`);
}

// The signed-in tutor's students (RLS limits rows to their own).
export async function listStudents(): Promise<StudentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('students').select(STUDENT_SELECT);

  if (error) loadFailed('students', error.code);
  return data.map(toStudentListItem);
}

// null when the student doesn't exist or belongs to another tutor.
export async function getStudent(id: string): Promise<StudentDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select(STUDENT_SELECT)
    .eq('id', id)
    .maybeSingle();

  // 22P02: the id isn't a valid uuid, which can only mean there's no such student.
  if (error?.code === '22P02') return null;
  if (error) loadFailed('student', error.code);
  return data ? toStudentDetail(data) : null;
}
