import { passwordSchema } from '@/schema/passwordSchema';
import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.email({ message: 'Please enter a valid email address.' }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });
