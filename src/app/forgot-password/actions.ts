'use server';

import { fromErrorToFormState, toFormState } from '@/utils/form';
import { createClient } from '@/lib/supabase/server';
import { forgotPasswordSchema } from './schema';

export async function forgotPassword(initialState: unknown, formData: FormData) {
  const supabase = await createClient();
  const payload = { email: String(formData.get('email') ?? '') };

  try {
    const { email } = forgotPasswordSchema.parse({
      email: formData.get('email'),
    });

    // The email links to /auth/confirm, which signs the user in and continues to
    // /update-password (configured in the Supabase "Reset Password" email template).
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return toFormState(
        'ERROR',
        "We couldn't send the email. Please try again in a few minutes.",
        payload
      );
    }
  } catch (error) {
    return fromErrorToFormState(error, payload);
  }

  // Same message whether or not the account exists, so emails can't be probed.
  return toFormState(
    'SUCCESS',
    "If an account exists for that email, we've sent a link to reset your password."
  );
}
