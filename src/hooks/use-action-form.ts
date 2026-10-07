import { ActionState, EMPTY_FORM_STATE, toFormState } from '@/utils/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';
import { unstable_rethrow } from 'next/navigation';

export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

type Options<TInput extends FieldValues, TOutput extends FieldValues> = {
  schema: z.ZodType<TOutput, TInput>;
  action: Action;
  defaultValues: DefaultValues<TInput>;
};

export type ActionFormApi<
  TInput extends FieldValues = FieldValues,
  TOutput extends FieldValues = TInput,
> = {
  form: UseFormReturn<TInput, unknown, TOutput>;
  actionState: ActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
};

export function useActionForm<TInput extends FieldValues, TOutput extends FieldValues>({
  schema,
  action,
  defaultValues,
}: Options<TInput, TOutput>): ActionFormApi<TInput, TOutput> {
  // Without JS the form posts straight to this server action (progressive enhancement).
  const [serverState, formAction, serverPending] = useActionState(action, EMPTY_FORM_STATE);

  // With JS, submissions go through this wrapper so a failed request (e.g. offline) becomes an
  // error message instead of an error page, and the tutor keeps what they typed. Next.js
  // redirect/notFound errors are rethrown so navigation still works.
  const [clientState, clientAction, clientPending] = useActionState(
    async (state: ActionState, formData: FormData) => {
      try {
        return await action(state, formData);
      } catch (error) {
        unstable_rethrow(error);
        return toFormState('ERROR', NETWORK_ERROR_MESSAGE);
      }
    },
    EMPTY_FORM_STATE
  );

  const actionState = clientState.timestamp > serverState.timestamp ? clientState : serverState;

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues,
  });

  // React Hook Form only focuses errors it found itself; move focus to the first field the
  // server rejected (e.g. a duplicate name) as well.
  useEffect(() => {
    const fields = Object.keys(actionState.fieldErrors.properties ?? {});
    if (actionState.status !== 'ERROR' || fields.length === 0) return;

    const first = Object.keys(form.getValues()).find((name) => fields.includes(name)) ?? fields[0];
    form.setFocus(first as Path<TInput>);
  }, [actionState, form]);

  // handleSubmit prevents the native post and only dispatches once client validation passes.
  const onSubmit = form.handleSubmit((_data, event) => {
    const formElement = event?.target as HTMLFormElement;
    startTransition(() => clientAction(new FormData(formElement)));
  });

  return { form, actionState, formAction, pending: serverPending || clientPending, onSubmit };
}
