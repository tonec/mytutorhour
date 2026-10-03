import { Button, Input, Label, Surface, TextField } from '@heroui/react';
import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <Surface className="flex w-full min-w-85 flex-col gap-4 rounded-3xl p-6">
      <form>
        <TextField className="w-full max-w-64" name="email" type="text">
          <Label>Email</Label>
          <Input variant="secondary" placeholder="Enter your email" />
        </TextField>

        <TextField className="w-full max-w-64" name="password" type="text">
          <Label>Password</Label>
          <Input variant="secondary" placeholder="Enter your password" />
        </TextField>

        <Button type="submit" formAction={login}>
          Log in
        </Button>
        <Button type="submit" formAction={signup}>
          Sign up
        </Button>
      </form>
    </Surface>
  );
}
