import { routes } from '@/config/routes';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { StudentListItem } from './mappers';

export function StudentRow({ student }: { student: StudentListItem }) {
  return (
    <li>
      <Link
        href={`${routes.students.url}/${student.id}`}
        data-testid="student-row"
        className="hover:bg-muted/50 focus-visible:ring-ring/50 flex flex-col gap-1 rounded-md px-3 py-3 outline-none focus-visible:ring-3"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">{student.displayName}</span>
          <Badge variant="secondary" data-testid="student-type-badge">
            {student.type === 'child' ? 'Child' : 'Adult'}
          </Badge>
        </span>
        <span className="text-muted-foreground flex flex-wrap gap-x-2 text-sm">
          {student.familyName ? <span>{student.familyName}</span> : null}
          <span>
            {student.subject} · {student.level}
          </span>
        </span>
      </Link>
    </li>
  );
}
