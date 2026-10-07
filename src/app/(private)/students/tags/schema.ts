import { z } from 'zod';

const TAG_NAME_MESSAGE = 'Tag names must be 1–30 characters.';

export const tagNameSchema = z
  .string({ message: TAG_NAME_MESSAGE })
  .trim()
  .min(1, TAG_NAME_MESSAGE)
  .max(30, TAG_NAME_MESSAGE);

export const renameTagSchema = z.object({
  id: z.uuid(),
  name: tagNameSchema,
});

export const deleteTagSchema = z.object({
  id: z.uuid(),
});
