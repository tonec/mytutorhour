import { passwordSchema } from '@/schema/password/password-schema';
import { z } from 'zod';

export const signupSchema = z
  .object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.email({ message: 'Please enter a valid email address.' }),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });
