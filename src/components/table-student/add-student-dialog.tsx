'use client';

import { type RefObject } from 'react';
import type { FamilyListItem } from '@/services/db/family';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentForm } from '../form-student/form';

type Props = {
  families: FamilyListItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Where focus goes when the dialog closes (the Add student button).
  returnFocusTo?: RefObject<HTMLElement | null>;
};

export function AddStudentDialog({ families, open, onOpenChange, returnFocusTo }: Props) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The form is taller than a phone screen, so the dialog scrolls. */}
      <DialogContent
        data-testid="add-student-dialog"
        finalFocus={returnFocusTo}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>Add student</DialogTitle>
        </DialogHeader>
        {/* Remounted on each open, so the form starts empty every time. */}
        {open ? (
          <StudentForm families={families} intent="dialog" onSaved={close} onCancel={close} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
