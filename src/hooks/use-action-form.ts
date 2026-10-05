import { ActionState, EMPTY_FORM_STATE } from '@/utils/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState } from 'react';
import { type DefaultValues, type FieldValues, type UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

type Options<TInput extends FieldValues, TOutput extends FieldValues> = {
  schema: z.ZodType<TOutput, TInput>;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
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
  const [actionState, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues,
  });

  // Without JS the form posts straight to the server action. With JS, handleSubmit
  // prevents that and only dispatches the action once client validation passes.
  const onSubmit = form.handleSubmit((_data, event) => {
    const formElement = event?.target as HTMLFormElement;
    startTransition(() => formAction(new FormData(formElement)));
  });

  return { form, actionState, formAction, pending, onSubmit };
}
