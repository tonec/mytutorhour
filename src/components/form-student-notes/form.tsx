'use client';

import { useEffect } from 'react';
import { useActionForm } from '@/hooks/use-action-form';
import { ActionForm } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { TextareaField } from '@/components/ui/textarea-field';
import { saveStudentNotes } from './actions';
import { studentNotesSchema } from './schema';

type Props = {
  student: { id: string; notes?: string };
  onSaved: () => void;
  onCancel: () => void;
};

export function StudentNotesForm({ student, onSaved, onCancel }: Props) {
  const notesForm = useActionForm({
    schema: studentNotesSchema,
    action: saveStudentNotes,
    defaultValues: { id: student.id, notes: student.notes ?? '' },
  });
  const { actionState } = notesForm;

  useEffect(() => {
    if (actionState.status === 'SUCCESS') onSaved();
  }, [actionState, onSaved]);

  return (
    <ActionForm actionForm={notesForm} aria-label="Notes" data-testid="student-notes-form">
      <div className="flex flex-col gap-6">
        <input type="hidden" name="id" value={student.id} />
        <TextareaField
          name="notes"
          label="Notes (only you can see these)"
          maxLength={2000}
          rows={8}
        />
        <FormMessage actionState={actionState} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={notesForm.pending}>
            Save notes
          </Button>
        </div>
      </div>
    </ActionForm>
  );
}
