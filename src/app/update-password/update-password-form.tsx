'use client';

import { useActionForm } from '@/hooks/use-action-form';
import { ActionForm } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { updatePassword } from './actions';
import { updatePasswordSchema } from './schema';

export function UpdatePasswordForm() {
  const updatePasswordForm = useActionForm({
    schema: updatePasswordSchema,
    action: updatePassword,
    defaultValues: { password: '', confirm: '' },
  });

  return (
    <ActionForm actionForm={updatePasswordForm}>
      <div className="flex flex-col gap-6">
        <FormField name="password" label="New password" type="password" />
        <FormField name="confirm" label="Confirm password" type="password" />
        <FormMessage actionState={updatePasswordForm.actionState} />
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={updatePasswordForm.pending}>
            Update password
          </Button>
        </div>
      </div>
    </ActionForm>
  );
}
