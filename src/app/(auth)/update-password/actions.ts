'use server';

import { routes } from '@/config/routes';
import { fromErrorToFormState, toFormState } from '@/utils/form';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updatePasswordSchema } from './schema';

export async function updatePassword(initialState: unknown, formData: FormData) {
  const supabase = await createClient();

  try {
    const { password } = updatePasswordSchema.parse({
      password: formData.get('password'),
      confirm: formData.get('confirm'),
    });

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return toFormState(
        'ERROR',
        "We couldn't update your password. Please request a new reset link."
      );
    }
  } catch (error) {
    return fromErrorToFormState(error);
  }

  redirect(routes.dashboard.url);
}
