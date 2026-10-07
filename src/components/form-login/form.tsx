'use client';

import { useActionForm } from '@/hooks/use-action-form';
import { loginSchema } from '@/components/form-login/schema';
import { ActionForm } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { login } from './actions';

export function LoginForm() {
  const loginForm = useActionForm({
    schema: loginSchema,
    action: login,
    defaultValues: { email: '', password: '' },
  });

  return (
    <ActionForm actionForm={loginForm}>
      <div className="flex flex-col gap-6">
        <FormField name="email" label="Email" type="text" placeholder="me@example.com" />
        <FormField name="password" label="Password" type="password" />
        <FormMessage actionState={loginForm.actionState} />
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={loginForm.pending}>
            Log in
          </Button>
        </div>
      </div>
    </ActionForm>
  );
}
