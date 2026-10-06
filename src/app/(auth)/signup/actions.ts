'use server';

import { routes } from '@/config/routes';
import { fromErrorToFormState, toFormState } from '@/utils/form';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signupSchema } from './schema';

export async function signup(initialState: unknown, formData: FormData) {
  const supabase = await createClient();
  const payload = { email: String(formData.get('email') ?? '') };

  try {
    const { firstname, lastname, email, password } = signupSchema.parse({
      firstname: formData.get('firstname'),
      lastname: formData.get('lastname'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirm: formData.get('confirm'),
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { firstname, lastname } },
    });

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

  redirect(routes.dashboard.url);
}
