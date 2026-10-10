'use client';

import { useEffect, useState } from 'react';
import { StudentNotesForm } from '../form-student-notes/form';
import { useModal } from '../ui/modal';
import { type StudentForEdit, loadStudentForEdit } from './actions';

export function StudentNotesModal() {
  const modal = useModal();
  const studentId = modal.data;
  const [loaded, setLoaded] = useState<StudentForEdit | undefined>(studentId ? undefined : null);

  useEffect(() => {
    if (!studentId) return;

    let current = true;

    void loadStudentForEdit(studentId).then((result) => {
      if (current) setLoaded(result);
    });

    return () => {
      current = false;
    };
  }, [studentId]);

  if (loaded === undefined) {
    return <p className="text-muted-foreground text-sm">Loading student…</p>;
  }

  // The dialog's own close button closes it.
  if (!loaded) {
    return (
      <p role="alert" className="text-sm">
        This student couldn’t be loaded. Please try again.
      </p>
    );
  }

  return <StudentNotesForm student={loaded.student} onSaved={close} onCancel={close} />;
}
