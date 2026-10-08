import { listStudents } from '@/services/db/student/student';
import { StudentTable } from './table';

export async function StudentTableContainer() {
  const students = await listStudents();

  return <StudentTable students={students} />;
}
