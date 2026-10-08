import { optionalEmail, optionalText, optionalUuid, requiredText } from '@/schema/fields';
import { phoneSchema } from '@/schema/phone/phone-schema';
import { z } from 'zod';

const sharedFields = {
  id: optionalUuid,
  firstName: requiredText(50, 'Enter a first name.'),
  subject: requiredText(50, 'Enter a subject.'),
  level: requiredText(50, 'Enter a level.'),
  examBoard: optionalText(50),
  notes: optionalText(2000),
  tagIds: z.array(z.uuid()).default([]),
  // 'dialog' when the student is added from the list's dialog (no redirect).
  intent: z
    .enum(['dialog', ''])
    .optional()
    .transform((value) => (value === 'dialog' ? value : undefined)),
};

// A child has a first name only and takes their contact details from their family, so the
// family is required and adult-only fields are dropped (FR-007).
const childSchema = z.object({
  type: z.literal('child'),
  ...sharedFields,
  familyId: z
    .string({ message: 'Choose or add a family.' })
    .trim()
    .min(1, 'Choose or add a family.')
    .pipe(z.uuid({ message: 'Choose or add a family.' })),
});

// An adult has a required last name and may have their own email, phone and family (FR-009).
const adultSchema = z.object({
  type: z.literal('adult'),
  ...sharedFields,
  lastName: requiredText(50, 'Enter a last name.'),
  familyId: optionalUuid,
  email: optionalEmail,
  phone: phoneSchema,
});

export const studentSchema = z.discriminatedUnion('type', [childSchema, adultSchema], {
  error: 'Choose adult or child.',
});

export type StudentInput = z.input<typeof studentSchema>;
export type StudentData = z.output<typeof studentSchema>;

const TEXT_FIELDS = [
  'id',
  'type',
  'firstName',
  'lastName',
  'familyId',
  'subject',
  'level',
  'examBoard',
  'notes',
  'email',
  'phone',
  'intent',
] as const;

// Reads the student form's FormData into the shape studentSchema expects.
export function studentFormDataToInput(formData: FormData) {
  const input: Record<string, string | string[]> = {};

  for (const key of TEXT_FIELDS) {
    const value = formData.get(key);
    if (typeof value === 'string') input[key] = value;
  }

  input.tagIds = formData.getAll('tagIds').filter((value) => typeof value === 'string');

  return input;
}
