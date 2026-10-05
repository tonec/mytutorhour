import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UpdatePasswordForm } from './update-password-form';

export default function UpdatePasswordPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-center text-2xl leading-normal font-medium">
          Choose a new password
        </h1>
      </CardHeader>

      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
