import { routes } from '@/config/routes';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/form-forgot-password/form';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-center text-2xl leading-normal font-medium">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-center text-sm">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>
      </CardHeader>

      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter className="flex-col">
        <Link
          href={routes.login.url}
          className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </CardFooter>
    </Card>
  );
}
