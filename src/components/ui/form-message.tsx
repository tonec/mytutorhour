import { FormState } from '@/utils/form';

type Props = {
  formState: FormState;
};

export function FormMessage({ formState }: Props) {
  return (
    <p
      className={formState.status === 'ERROR' ? 'text-sm text-red-400' : 'text-sm'}
      aria-live="polite"
    >
      {formState.message}
    </p>
  );
}
