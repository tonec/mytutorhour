import { FormState } from '@/utils/form';

type Props = {
  formState: FormState;
  name: string;
};

export function FieldError({ formState, name }: Props) {
  const message = formState.fieldErrors.properties?.[name]?.errors?.[0];

  if (!message) return null;

  return (
    <span className="text-xs text-red-400" aria-live="polite">
      {formState.fieldErrors.properties?.[name]?.errors?.[0]}
    </span>
  );
}
