'use client';

import { EMPTY_FORM_STATE } from '@/utils/form';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { FormMessage } from '@/components/ui/form-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from './actions';

export function LoginForm() {
  const [formState, formAction, pending] = useActionState(login, EMPTY_FORM_STATE);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            // Remount with the new defaultValue after each submit; Base UI warns if it changes in place.
            key={formState.timestamp}
            id="email"
            type="text"
            name="email"
            placeholder="me@example.com"
            defaultValue={formState.payload?.email}
          />
          <FieldError formState={formState} name="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" />
          <FieldError formState={formState} name="password" />
          <a
            href="#"
            className="text-muted-foreground ml-auto inline-block text-xs underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        <FormMessage formState={formState} />
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={pending}>
            Log in
          </Button>
        </div>
      </div>
    </form>
  );
}
