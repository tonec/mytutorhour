import { z } from 'zod';

// Form inputs always send a string, so an optional field arrives as ''. These helpers trim the
// value and turn an empty one into undefined before any other check runs.
const blankToUndefined = (value: string | undefined) => (value ? value : undefined);

const tooLong = (max: number) => `Must be ${max.toLocaleString('en-GB')} characters or fewer.`;

export const requiredText = (max: number, message: string) =>
  z.string({ message }).trim().min(1, message).max(max, tooLong(max));

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform(blankToUndefined)
    .pipe(z.string().max(max, tooLong(max)).optional());

export const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform(blankToUndefined)
  .pipe(z.uuid().optional());

export const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform(blankToUndefined)
  .pipe(z.email({ message: 'Please enter a valid email address.' }).max(254).optional());
