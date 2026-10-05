'use client';

import { getFieldError } from '@/utils/form';
import { useFormContext } from 'react-hook-form';
import { useActionStateContext } from '@/components/ui/action-form';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue'> & {
  name: string;
  label: string;
};

export function FormField({ name, label, id = name, ...inputProps }: Props) {
  const actionState = useActionStateContext();
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const clientError = errors[name]?.message as string | undefined;

  return (
    <div className="relative grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        // Remount with the new defaultValue after each submit; Base UI warns if it changes in place.
        key={actionState.timestamp}
        id={id}
        // Without JS, keep the submitted value (the server never echoes passwords).
        defaultValue={actionState.payload?.[name]}
        aria-invalid={Boolean(clientError ?? getFieldError(actionState, name))}
        aria-describedby={`${name}-error`}
        {...inputProps}
        {...register(name)}
      />
      <FieldError actionState={actionState} name={name} clientError={clientError} />
    </div>
  );
}
