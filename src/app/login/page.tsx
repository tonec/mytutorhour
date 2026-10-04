import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { login } from './actions';

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-center text-2xl leading-normal font-medium">
          Log in to your account
        </h1>
      </CardHeader>

      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
              <a
                href="#"
                className="text-muted-foreground ml-auto inline-block text-xs underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-1/2" formAction={login}>
          Login
        </Button>
        <Link
          href="/register"
          className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
