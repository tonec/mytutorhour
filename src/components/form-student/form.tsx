'use client';

import { routes } from '@/config/routes';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import Link from 'next/link';
import type { FamilyListItem } from '@/services/db/family';
import { useActionForm } from '@/hooks/use-action-form';
import { saveStudent } from '@/components/form-student/actions';
import { ActionForm } from '@/components/ui/action-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { RadioGroupField } from '@/components/ui/radio-group-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { Wizard, type WizardStep } from '@/components/ui/wizard';
import type { StudentDetail } from '../../services/db/student/mappers';
import { ContactDetails } from './contact-details';
import { FamilyPicker } from './family-picker';
import { studentSchema } from './schema';

const TYPE_OPTIONS = [
  { value: 'child', label: 'Child' },
  { value: 'adult', label: 'Adult' },
];

type Props = {
  student?: StudentDetail;
  families: FamilyListItem[];
  // 'dialog' when used in the list's add or edit student dialog: onSaved runs instead of a redirect.
  intent?: 'dialog';
  onSaved?: () => void;
  // Replaces the Cancel link (back to the list) with a button, e.g. to close a dialog.
  onCancel?: () => void;
};

export function StudentForm({
  student,
  families: initialFamilies,
  intent,
  onSaved,
  onCancel,
}: Props) {
  const [families, setFamilies] = useState(initialFamilies);
  const studentForm = useActionForm({
    schema: studentSchema,
    action: saveStudent,
    defaultValues: {
      id: student?.id ?? '',
      type: student?.type ?? 'child',
      firstName: student?.firstName ?? '',
      lastName: student?.lastName ?? '',
      familyId: student?.familyId ?? '',
      subject: student?.subject ?? '',
      level: student?.level ?? '',
      examBoard: student?.examBoard ?? '',
      notes: student?.notes ?? '',
      tagIds: student?.tagIds ?? [],
      intent: intent ?? '',
    },
  });
  const { actionState } = studentForm;
  const { control } = studentForm.form;
  const type = useWatch({ control, name: 'type' });
  const familyId = useWatch({ control, name: 'familyId' }) as string | undefined;
  const family = families.find((option) => option.id === familyId);

  useEffect(() => {
    if (intent === 'dialog' && actionState.status === 'SUCCESS') onSaved?.();
  }, [actionState, intent, onSaved]);

  const cancel = onCancel ? (
    <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
      Cancel
    </Button>
  ) : (
    <Link
      href={routes.students.url}
      className={buttonVariants({ variant: 'ghost', className: 'w-full' })}
    >
      Cancel
    </Link>
  );

  const steps: WizardStep[] = [
    {
      id: 'name',
      title: 'Name',
      fields: ['type', 'firstName', 'lastName'],
      content: (
        <>
          <RadioGroupField
            name="type"
            label="Student type"
            options={TYPE_OPTIONS}
            data-testid="student-type"
          />
          {/* Only adults have a last name; a child is known by first name and family (FR-007). */}
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField name="firstName" label="First name" autoComplete="off" />
            {type === 'adult' ? (
              <FormField name="lastName" label="Last name" autoComplete="off" />
            ) : null}
          </div>
        </>
      ),
    },
    {
      id: 'family',
      title: 'Family',
      fields: ['familyId'],
      content: (
        <>
          <FamilyPicker
            families={families}
            label="Family"
            onFamilyCreated={(created) => setFamilies((current) => [...current, created])}
          />
          {family ? (
            <ContactDetails
              heading="Contact (from family)"
              contact={{
                name: family.contactName,
                email: family.contactEmail,
                phone: family.contactPhone,
              }}
              emptyMessage={
                <>
                  No contact details:{' '}
                  <Link href={`${routes.families.url}/${family.id}`} className="underline">
                    add them to the family
                  </Link>
                </>
              }
            />
          ) : null}
        </>
      ),
    },
    {
      id: 'study',
      title: 'Subject, level, board',
      fields: ['subject', 'level', 'examBoard'],
      content: (
        <>
          <FormField name="subject" label="Subject" autoComplete="off" />
          <FormField name="level" label="Level" autoComplete="off" />
          <FormField name="examBoard" label="Exam board (optional)" autoComplete="off" />
        </>
      ),
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: ['notes'],
      content: (
        <TextareaField name="notes" label="Notes (only you can see these)" maxLength={2000} />
      ),
    },
  ];

  return (
    <ActionForm actionForm={studentForm} aria-label="Student" data-testid="student-form">
      <div className="flex flex-col gap-6">
        <input type="hidden" name="id" value={student?.id ?? ''} />
        <input type="hidden" name="intent" value={intent ?? ''} />
        <Wizard
          steps={steps}
          // A saved student can be changed one step at a time; a new one goes through in order.
          navigation={student ? 'free' : 'linear'}
          submitOnEveryStep={Boolean(student)}
          submitLabel="Save student"
          pending={studentForm.pending}
          footer={
            <>
              <FormMessage actionState={actionState} />
              {cancel}
            </>
          }
        />
      </div>
    </ActionForm>
  );
}
