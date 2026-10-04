import { FormState } from '@/utils/form';

type Props = {
  formState: FormState;
};

export function FormMessage({ formState }: Props) {
  return (
    <p
      className={
        formState.status === 'ERROR'
          ? 'text-sm text-red-400 empty:sr-only'
          : 'text-sm empty:sr-only'
      }
      aria-live="polite"
    >
      {formState.message ? (
        <span
          key={formState.timestamp}
          className="animate-in fade-in duration-300 motion-reduce:animate-none"
        >
          {formState.message}
        </span>
      ) : null}
    </p>
  );
}
