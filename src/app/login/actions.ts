'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from './schema';

export async function login(initialState: unknown, formData: FormData) {
  const supabase = await createClient();

  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  console.log('validatedFields ==> ', validatedFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    console.log('error', error);
    // redirect('/error');
    return;
  }

  revalidatePath('/', 'layout');
  redirect('/account');
}
