'use client';

import { type RefObject } from 'react';
import type { StudentListItem } from '@/services/db/student/mappers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentNotesForm } from '../form-student-notes/form';

type Props = {
  student: Pick<StudentListItem, 'id' | 'displayName' | 'notes'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo?: RefObject<HTMLElement | null>;
};

export function StudentNotesDialog({ student, open, onOpenChange, returnFocusTo }: Props) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="student-notes-dialog" finalFocus={returnFocusTo}>
        <DialogHeader>
          <DialogTitle>Notes for {student.displayName}</DialogTitle>
        </DialogHeader>
        {/* Remounted on each open, so cancelled edits are discarded (FR-017). */}
        {open ? <StudentNotesForm student={student} onSaved={close} onCancel={close} /> : null}
      </DialogContent>
    </Dialog>
  );
}
