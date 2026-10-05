'use client';

import { useActionForm } from '@/hooks/use-action-form';
import { ActionForm } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { forgotPassword } from './actions';
import { forgotPasswordSchema } from './schema';

export function ForgotPasswordForm() {
  const forgotPasswordForm = useActionForm({
    schema: forgotPasswordSchema,
    action: forgotPassword,
    defaultValues: { email: '' },
  });

  return (
    <ActionForm actionForm={forgotPasswordForm}>
      <div className="flex flex-col gap-6">
        <FormField name="email" label="Email" type="email" placeholder="me@example.com" />
        <FormMessage actionState={forgotPasswordForm.actionState} />
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={forgotPasswordForm.pending}>
            Send reset link
          </Button>
        </div>
      </div>
    </ActionForm>
  );
}
