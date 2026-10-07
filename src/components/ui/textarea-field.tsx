'use client';

import { getFieldError } from '@/utils/form';
import { useFormContext, useWatch } from 'react-hook-form';
import { useActionStateContext } from '@/components/ui/action-form';
import { FieldError } from '@/components/ui/field-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHydrationSafeRegister } from '@/components/ui/use-hydration-safe-register';

type Props = Omit<React.ComponentProps<'textarea'>, 'name' | 'defaultValue'> & {
  name: string;
  label: string;
};

export function TextareaField({ name, label, id = name, maxLength, ...textareaProps }: Props) {
  const actionState = useActionStateContext();
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const registerField = useHydrationSafeRegister();
  const value = useWatch({ control, name }) as string | undefined;
  const clientError = errors[name]?.message as string | undefined;
  const countId = `${name}-count`;

  return (
    <div className="relative grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        // Remount with the new defaultValue after each submit, as FormField does.
        key={actionState.timestamp}
        id={id}
        defaultValue={actionState.payload?.[name]}
        maxLength={maxLength}
        aria-invalid={Boolean(clientError ?? getFieldError(actionState, name))}
        aria-describedby={maxLength ? `${name}-error ${countId}` : `${name}-error`}
        {...textareaProps}
        {...registerField(name)}
      />
      {maxLength ? (
        <span
          id={countId}
          className="text-muted-foreground justify-self-end text-xs"
          aria-live="polite"
        >
          {value?.length ?? 0}/{maxLength}
        </span>
      ) : null}
      <FieldError actionState={actionState} name={name} clientError={clientError} />
    </div>
  );
}
