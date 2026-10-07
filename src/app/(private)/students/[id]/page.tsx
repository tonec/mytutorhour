import { notFound } from 'next/navigation';
import { StudentForm } from '../../../../components/form-student/form';
import { listFamilies } from '../../families/data';
import { getStudent } from '../data';

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
