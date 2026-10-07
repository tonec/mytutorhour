'use client';

import { useEffect } from 'react';
import { useActionForm } from '@/hooks/use-action-form';
import { ActionForm } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { saveFamily } from './actions';
import { familySchema } from './schema';

export type SavedFamily = {
  id: string;
  name: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
};

type Props = {
  family?: {
    id: string;
    name: string;
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  // 'inline' when used in the student form's dialog: the new family is handed to onSaved.
  intent?: 'inline';
  onSaved?: (family: SavedFamily) => void;
};

export function FamilyForm({ family, intent, onSaved }: Props) {
  const familyForm = useActionForm({
    schema: familySchema,
    action: saveFamily,
    defaultValues: {
      id: family?.id ?? '',
      name: family?.name ?? '',
      contactName: family?.contactName ?? '',
      contactEmail: family?.contactEmail ?? '',
      contactPhone: family?.contactPhone ?? '',
      intent: intent ?? '',
    },
  });
  const { actionState } = familyForm;

  useEffect(() => {
    const saved = actionState.payload;
    if (intent !== 'inline' || actionState.status !== 'SUCCESS' || !saved?.id) return;
    onSaved?.({
      id: saved.id,
      name: saved.name,
      contactName: saved.contactName,
      contactEmail: saved.contactEmail || undefined,
      contactPhone: saved.contactPhone || undefined,
    });
  }, [actionState, intent, onSaved]);

  return (
    <ActionForm
      actionForm={{
        ...familyForm,
        // The dialog is portalled out of the student form in the DOM, but React still bubbles
        // events through the component tree, so stop this submit reaching the student form.
        onSubmit: (event) => {
          event?.stopPropagation();
          return familyForm.onSubmit(event);
        },
      }}
      aria-label={intent === 'inline' ? 'Add family' : 'Family'}
      data-testid="family-form"
    >
      <div className="flex flex-col gap-6">
        <input type="hidden" name="id" value={family?.id ?? ''} />
        <input type="hidden" name="intent" value={intent ?? ''} />
        <FormField name="name" label="Family name" autoComplete="family-name" />
        <FormField name="contactName" label="Contact name" autoComplete="name" />
        <FormField
          name="contactEmail"
          label="Contact email (optional)"
          type="email"
          autoComplete="email"
        />
        <FormField
          name="contactPhone"
          label="Contact phone (optional)"
          type="tel"
          autoComplete="tel"
        />
        <FormMessage actionState={actionState} />
        <Button type="submit" className="w-full" disabled={familyForm.pending}>
          {intent === 'inline' ? 'Add family' : 'Save family'}
        </Button>
      </div>
    </ActionForm>
  );
}
