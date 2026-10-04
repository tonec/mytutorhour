import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-center text-2xl leading-normal font-medium">
          Log in to your account
        </h1>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex-col">
        <a
          href="#"
          className="text-muted-foreground mx-auto inline-block text-xs underline-offset-4 hover:underline"
        >
          Forgot your password?
        </a>
        <Link
          href="/signup"
          className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
