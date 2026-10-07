'use client';

import { useActionForm } from '@/hooks/use-action-form';
import { signupSchema } from '@/components/form-signup/schema';
import { ActionForm } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { signup } from './actions';

export function SignUpForm() {
  const signupForm = useActionForm({
    schema: signupSchema,
    action: signup,
    defaultValues: { firstname: '', lastname: '', email: '', password: '', confirm: '' },
  });

  return (
    <ActionForm actionForm={signupForm}>
      <div className="flex flex-col gap-6">
        <FormField name="firstname" label="First name" type="text" />
        <FormField name="lastname" label="Last name" type="email" />
        <FormField name="email" label="Email" type="email" placeholder="you@example.com" />
        <FormField name="password" label="Password" type="password" />
        <FormField name="confirm" label="Confirm password" type="password" />
        <FormMessage actionState={signupForm.actionState} />
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={signupForm.pending}>
            Sign up
          </Button>
        </div>
      </div>
    </ActionForm>
  );
}
