import { z } from 'zod';

const PHONE_CHARACTERS = /^\+?[\d\s\-()]+$/;

// UK and international numbers: an optional leading +, digits, spaces, - and (), with 7–15 digits
// (the E.164 maximum) once punctuation is removed.
function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return PHONE_CHARACTERS.test(value) && digits.length >= 7 && digits.length <= 15;
}

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => value === undefined || isValidPhone(value), {
    message: 'Enter a valid phone number.',
  });
