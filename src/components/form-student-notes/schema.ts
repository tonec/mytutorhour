import { optionalText } from '@/schema/fields';
import { z } from 'zod';

// Notes edited on their own from the student list (FR-030). Same 2,000 limit as the student form.
export const studentNotesSchema = z.object({
  id: z.uuid(),
  notes: optionalText(2000),
});
