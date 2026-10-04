'use server';

import { fromErrorToFormState, toFormState } from '@/utils/form';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from './schema';

export async function login(initialState: unknown, formData: FormData) {
  const supabase = await createClient();
  const payload = { email: String(formData.get('email') ?? '') };

  try {
    const validatedFields = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const { error } = await supabase.auth.signInWithPassword(validatedFields);

    if (error) {
      return toFormState('ERROR', 'Incorrect email or password.', payload);
    }
  } catch (error) {
    return fromErrorToFormState(error, payload);
  }

  redirect('/account');
}
