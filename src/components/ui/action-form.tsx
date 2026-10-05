'use client';

import { ActionState } from '@/utils/form';
import { createContext, useContext } from 'react';
import { type FieldValues, FormProvider } from 'react-hook-form';
import { type ActionFormApi } from '@/hooks/use-action-form';

const ActionStateContext = createContext<ActionState | null>(null);

export function useActionStateContext() {
  const actionState = useContext(ActionStateContext);

  if (!actionState) {
    throw new Error('useActionStateContext must be used inside <ActionForm>.');
  }

  return actionState;
}

type Props<TInput extends FieldValues, TOutput extends FieldValues> = Omit<
  React.ComponentProps<'form'>,
  'action' | 'onSubmit'
> & {
  actionForm: ActionFormApi<TInput, TOutput>;
};

export function ActionForm<TInput extends FieldValues, TOutput extends FieldValues>({
  actionForm,
  children,
  ...formProps
}: Props<TInput, TOutput>) {
  const { form, actionState, formAction, onSubmit } = actionForm;

  return (
    <FormProvider {...form}>
      <ActionStateContext.Provider value={actionState}>
        <form action={formAction} onSubmit={onSubmit} noValidate {...formProps}>
          {children}
        </form>
      </ActionStateContext.Provider>
    </FormProvider>
  );
}
