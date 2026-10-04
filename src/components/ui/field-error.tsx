import { FormState } from '@/utils/form';

type Props = {
  formState: FormState;
  name: string;
};

export function FieldError({ formState, name }: Props) {
  const message = formState.fieldErrors.properties?.[name]?.errors?.[0];

  return (
    <span
      className="absolute right-0 -bottom-5 text-xs text-red-400 empty:sr-only"
      aria-live="polite"
    >
      {message ? (
        <span
          key={formState.timestamp}
          className="animate-in fade-in duration-300 motion-reduce:animate-none"
        >
          {message}
        </span>
      ) : null}
    </span>
  );
}
