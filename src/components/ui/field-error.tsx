import { ActionState, getFieldError } from '@/utils/form';

type Props = {
  actionState: ActionState;
  name: string;
  clientError?: string;
};

export function FieldError({ actionState, name, clientError }: Props) {
  const message = clientError ?? getFieldError(actionState, name);

  // The live region stays mounted so screen readers announce new errors; the keyed
  // inner span remounts on each new message so the fade replays.
  return (
    <span
      id={`${name}-error`}
      className="absolute right-0 -bottom-5 text-xs text-red-400 empty:sr-only"
      aria-live="polite"
    >
      {message ? (
        <span
          key={clientError ?? actionState.timestamp}
          className="animate-in fade-in duration-300 motion-reduce:animate-none"
        >
          {message}
        </span>
      ) : null}
    </span>
  );
}
