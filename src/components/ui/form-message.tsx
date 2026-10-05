import { ActionState } from '@/utils/form';

type Props = {
  actionState: ActionState;
};

export function FormMessage({ actionState }: Props) {
  return (
    <p
      className={
        actionState.status === 'ERROR'
          ? 'text-sm text-red-400 empty:sr-only'
          : 'text-sm empty:sr-only'
      }
      aria-live="polite"
    >
      {actionState.message ? (
        <span
          key={actionState.timestamp}
          className="animate-in fade-in duration-300 motion-reduce:animate-none"
        >
          {actionState.message}
        </span>
      ) : null}
    </p>
  );
}
