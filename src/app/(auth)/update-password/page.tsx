import { UpdatePasswordForm } from '@/components/form-update-password/form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
