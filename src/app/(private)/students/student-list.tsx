import type { StudentListItem } from './mappers';
import { StudentRow } from './student-row';

export function StudentList({ students }: { students: StudentListItem[] }) {
  return (
    <ul data-testid="student-list" className="divide-border flex flex-col divide-y">
      {students.map((student) => (
        <StudentRow key={student.id} student={student} />
      ))}
    </ul>
  );
}
