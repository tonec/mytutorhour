'use client';

import { closeModal } from '@/utils/modal-url';
import type { FamilyListItem } from '@/services/db/family';
import { StudentForm } from '../form-student/form';

type Props = {
  families: FamilyListItem[];
};

export function AddStudentModal({ families }: Props) {
  return (
    <StudentForm families={families} intent="dialog" onSaved={closeModal} onCancel={closeModal} />
  );
}
