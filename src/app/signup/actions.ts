'use server';

import { fromErrorToFormState } from '@/utils/form';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signupSchema } from './schema';

export async function signup(initialState: unknown, formData: FormData) {
  const supabase = await createClient();

  try {
    const validatedFields = signupSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await supabase.auth.signInWithPassword(validatedFields);
  } catch (error) {
    return fromErrorToFormState(error);
  }

  redirect('/account');
}
