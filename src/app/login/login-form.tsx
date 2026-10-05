'use client';

import { EMPTY_FORM_STATE, getFieldError } from '@/utils/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { FormMessage } from '@/components/ui/form-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from './actions';
import { loginSchema } from './schema';

export function LoginForm() {
  const [actionState, formAction, pending] = useActionState(login, EMPTY_FORM_STATE);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: actionState.payload?.email ?? '', password: '' },
  });

  // Without JS the form posts straight to the server action. With JS, handleSubmit
  // prevents that and only dispatches the action once client validation passes.
  const onValid = (_data: unknown, event?: React.BaseSyntheticEvent) => {
    const form = event?.target as HTMLFormElement;
    startTransition(() => formAction(new FormData(form)));
  };

  const emailError = errors.email?.message;
  const passwordError = errors.password?.message;

  return (
    <form action={formAction} onSubmit={handleSubmit(onValid)} noValidate>
      <div className="flex flex-col gap-6">
        <div className="relative grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            // Remount with the new defaultValue after each submit; Base UI warns if it changes in place.
            key={actionState.timestamp}
            id="email"
            type="text"
            placeholder="me@example.com"
            defaultValue={actionState.payload?.email}
            aria-invalid={Boolean(emailError ?? getFieldError(actionState, 'email'))}
            aria-describedby="email-error"
            {...register('email')}
          />
          <FieldError actionState={actionState} name="email" clientError={emailError} />
        </div>
        <div className="relative grid gap-2">
          <div className="flex">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            aria-invalid={Boolean(passwordError ?? getFieldError(actionState, 'password'))}
            aria-describedby="password-error"
            {...register('password')}
          />
          <FieldError actionState={actionState} name="password" clientError={passwordError} />
        </div>
        <FormMessage actionState={actionState} />
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={pending}>
            Log in
          </Button>
        </div>
      </div>
    </form>
  );
}
