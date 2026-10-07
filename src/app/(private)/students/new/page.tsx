import { StudentForm } from '../../../../components/student-form/student-form';
import { listFamilies } from '../../families/data';

export default async function NewStudentPage() {
  const families = await listFamilies();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <StudentForm families={families} />
    </div>
  );
}
