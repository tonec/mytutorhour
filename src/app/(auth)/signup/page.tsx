import { routes } from '@/config/routes';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { SignUpForm } from './signup-form';

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-center text-2xl leading-normal font-medium">
          Create an account
        </h1>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex-col">
        <Link
          href={routes.login.url}
          className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
        >
          Already have an account? Log in
        </Link>
      </CardFooter>
    </Card>
  );
}
