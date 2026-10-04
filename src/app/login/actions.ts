'use server';

import { fromErrorToFormState } from '@/utils/form';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from './schema';

export async function login(initialState: unknown, formData: FormData) {
  const supabase = await createClient();

  try {
    const validatedFields = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await supabase.auth.signInWithPassword(validatedFields);
  } catch (error) {
    return fromErrorToFormState(error);
  }

  redirect('/account');
}
