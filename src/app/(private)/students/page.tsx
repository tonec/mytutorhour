import { routes } from '@/config/routes';
import Link from 'next/link';
import { StudentTableContainer } from '@/components/table-student/table-container';
import { buttonVariants } from '@/components/ui/button';

export default function StudentsPage() {
  return (
    <div className="w-full">
      {/* <Link
        href={routes.studentNew.url}
        className={buttonVariants({ className: 'w-full sm:w-auto sm:self-end' })}
      >
        Add student
      </Link> */}
      <StudentTableContainer />
    </div>
  );
}
