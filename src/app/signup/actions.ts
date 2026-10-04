'use server';

import { fromErrorToFormState, toFormState } from '@/utils/form';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signupSchema } from './schema';

export async function signup(initialState: unknown, formData: FormData) {
  const supabase = await createClient();
  const payload = { email: String(formData.get('email') ?? '') };

  try {
    const { email, password } = signupSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirm: formData.get('confirm'),
    });

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return toFormState('ERROR', "We couldn't create your account. Please try again.", payload);
    }

    // With "Confirm email" enabled, Supabase returns no session until the
    // user clicks the link in their inbox (handled by /auth/confirm).
    if (!data.session) {
      return toFormState('SUCCESS', 'Check your email for a link to confirm your account.');
    }
  } catch (error) {
    return fromErrorToFormState(error, payload);
  }

  redirect('/account');
}
