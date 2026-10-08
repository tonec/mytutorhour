import { listStudents } from '@/services/db/student/student';
import { StudentTable } from '@/components/table-student/table';

export default async function StudentsPage() {
  const students = await listStudents();

  return (
    <div className="h-full w-full">
      <StudentTable students={students} />
    </div>
  );
}
