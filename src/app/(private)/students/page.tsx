import { listFamilies } from '@/services/db/family';
import { listStudents } from '@/services/db/student/student';
import { StudentTable } from '@/components/table-student/table';

export default async function StudentsPage() {
  const [students, families] = await Promise.all([listStudents(), listFamilies()]);

  return (
    <div className="h-full w-full">
      <StudentTable students={students} families={families} />
    </div>
  );
}
