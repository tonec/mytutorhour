import { optionalEmail, optionalUuid, requiredText } from '@/schema/fields';
import { phoneSchema } from '@/schema/phone/phone-schema';
import { z } from 'zod';

export const familySchema = z.object({
  id: optionalUuid,
  name: requiredText(60, 'Enter a family name.'),
  contactName: requiredText(100, 'Enter a contact name.'),
  contactEmail: optionalEmail,
  contactPhone: phoneSchema,
  // 'inline' when the family is added from the student form's dialog (no redirect).
  intent: z
    .enum(['inline', ''])
    .optional()
    .transform((value) => (value === 'inline' ? value : undefined)),
});

export type FamilyInput = z.input<typeof familySchema>;
export type FamilyData = z.output<typeof familySchema>;
