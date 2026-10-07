import { passwordSchema } from '@/schema/password/password-schema';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address.' }),
  password: passwordSchema,
});
