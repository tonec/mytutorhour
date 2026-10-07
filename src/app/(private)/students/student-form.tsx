'use client';

import { routes } from '@/config/routes';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import Link from 'next/link';
import { useActionForm } from '@/hooks/use-action-form';
import { ActionForm } from '@/components/ui/action-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { RadioGroupField } from '@/components/ui/radio-group-field';
import { TextareaField } from '@/components/ui/textarea-field';
import type { FamilyListItem } from '../families/data';
import { saveStudent } from './actions';
import { ContactDetails } from './contact-details';
import { FamilyPicker } from './family-picker';
import type { StudentDetail } from './mappers';
import { studentSchema } from './schema';

const TYPE_OPTIONS = [
  { value: 'child', label: 'Child' },
  { value: 'adult', label: 'Adult' },
];

type Props = {
  student?: StudentDetail;
  families: FamilyListItem[];
};

export function StudentForm({ student, families: initialFamilies }: Props) {
  const [families, setFamilies] = useState(initialFamilies);
  const studentForm = useActionForm({
    schema: studentSchema,
    action: saveStudent,
    defaultValues: {
      id: student?.id ?? '',
      type: student?.type ?? 'child',
      firstName: student?.firstName ?? '',
      familyId: student?.familyId ?? '',
      subject: student?.subject ?? '',
      level: student?.level ?? '',
      examBoard: student?.examBoard ?? '',
      notes: student?.notes ?? '',
      tagIds: student?.tagIds ?? [],
    },
  });
  const { control } = studentForm.form;
  const familyId = useWatch({ control, name: 'familyId' }) as string | undefined;
  const family = families.find((option) => option.id === familyId);

  return (
    <ActionForm actionForm={studentForm} aria-label="Student" data-testid="student-form">
      <div className="flex flex-col gap-6">
        <input type="hidden" name="id" value={student?.id ?? ''} />
        <RadioGroupField
          name="type"
          label="Student type"
          options={TYPE_OPTIONS}
          data-testid="student-type"
        />
        <FormField name="firstName" label="First name" autoComplete="off" />
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
        <FormField name="subject" label="Subject" autoComplete="off" />
        <FormField name="level" label="Level" autoComplete="off" />
        <FormField name="examBoard" label="Exam board (optional)" autoComplete="off" />
        <TextareaField name="notes" label="Notes (only you can see these)" maxLength={2000} />
        <FormMessage actionState={studentForm.actionState} />
        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={studentForm.pending}>
            Save student
          </Button>
          <Link
            href={routes.students.url}
            className={buttonVariants({ variant: 'ghost', className: 'w-full' })}
          >
            Cancel
          </Link>
        </div>
      </div>
    </ActionForm>
  );
}
