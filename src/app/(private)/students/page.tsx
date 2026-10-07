import { routes } from '@/config/routes';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { listStudents } from './data';
import { StudentList } from './student-list';

export default async function StudentsPage() {
  const students = await listStudents();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <Link
        href={routes.studentNew.url}
        className={buttonVariants({ className: 'w-full sm:w-auto sm:self-end' })}
      >
        Add student
      </Link>
      <StudentList students={students} />
    </div>
  );
}
