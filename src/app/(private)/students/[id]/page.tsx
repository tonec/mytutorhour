import { notFound } from 'next/navigation';
import { listFamilies } from '../../families/data';
import { getStudent } from '../data';
import { StudentForm } from '../student-form';

type Props = { params: Promise<{ id: string }> };

export default async function StudentPage({ params }: Props) {
  const { id } = await params;
  const [student, families] = await Promise.all([getStudent(id), listFamilies()]);

  // Missing, or another tutor's (hidden by RLS): never reveal which (FR-026).
  if (!student) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <StudentForm student={student} families={families} />
    </div>
  );
}
