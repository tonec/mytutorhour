import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signup } from './actions';

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-center text-2xl leading-normal font-medium">
          Create an account
        </h1>
      </CardHeader>

      <CardContent>
        <form action={signup}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex items-center justify-center">
              <Button type="submit" className="w-1/2">
                Sign up
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col">
        <Link
          href="/register"
          className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
        >
          Already have an account? Log in
        </Link>
      </CardFooter>
    </Card>
  );
}
