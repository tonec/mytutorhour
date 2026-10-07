import { routes } from '@/config/routes';
import Link from 'next/link';
import { listStudents } from '@/services/db/student/student';
import { StudentTable } from '@/components/table-student/student-table';
import { buttonVariants } from '@/components/ui/button';

export default async function StudentsPage() {
  const students = await listStudents();

  return (
    <div className="w-full">
      <Link
        href={routes.studentNew.url}
        className={buttonVariants({ className: 'w-full sm:w-auto sm:self-end' })}
      >
        Add student
      </Link>
      <StudentTable students={students} />
    </div>
  );
}
