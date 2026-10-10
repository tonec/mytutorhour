'use server';

import { type FamilyListItem, listFamilies } from '@/services/db/family';
import type { StudentDetail } from '@/services/db/student/mappers';
import { getStudent } from '@/services/db/student/student';

export type StudentForEdit = { student: StudentDetail; families: FamilyListItem[] } | null;

// What the list's edit dialog needs: the same data as the student's own page. null when the
// student is missing, another tutor's (hidden by RLS) or couldn't be loaded (FR-026).
export async function loadStudentForEdit(id: string): Promise<StudentForEdit> {
  try {
    const [student, families] = await Promise.all([getStudent(id), listFamilies()]);
    return student ? { student, families } : null;
  } catch (error) {
    // The loaders' messages carry only the error code, never student data.
    console.error({ action: 'loadStudentForEdit', message: (error as Error).message });
    return null;
  }
}
