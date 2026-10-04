'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from './actions';

const initialState = {
  errors: {
    email: undefined,
    password: undefined,
  },
};

export function LoginForm() {
  const [formState, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="text" name="email" placeholder="m@example.com" required />
          <span className="text-xs text-red-400" aria-live="polite">
            {formState?.errors.email}
          </span>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          <a
            href="#"
            className="text-muted-foreground ml-auto inline-block text-xs underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        <div className="flex items-center justify-center">
          <Button type="submit" className="w-1/2" disabled={pending}>
            Log in
          </Button>
        </div>
      </div>
    </form>
  );
}
