import { type ActionState, EMPTY_FORM_STATE } from '@/utils/form';
import { type PropsWithChildren } from 'react';
import { type FieldValues, useForm } from 'react-hook-form';
import { ActionForm } from '@/components/ui/action-form';

type Props = PropsWithChildren<{
  defaultValues?: FieldValues;
  actionState?: ActionState;
  onSubmit?: (formData: FormData) => void;
}>;

// Renders field components inside a real ActionForm without a server action, for unit tests.
export function FormHarness({
  children,
  defaultValues = {},
  actionState = EMPTY_FORM_STATE,
  onSubmit,
}: Props) {
  const form = useForm({ defaultValues });

  return (
    <ActionForm
      actionForm={{
        form,
        actionState,
        formAction: () => {},
        pending: false,
        onSubmit: async (event) => {
          event?.preventDefault();
          onSubmit?.(new FormData(event?.target as HTMLFormElement));
        },
      }}
      aria-label="Test form"
    >
      {children}
      <button type="submit">Submit</button>
    </ActionForm>
  );
}

export function errorState(field: string, message: string): ActionState {
  return {
    status: 'ERROR',
    message: '',
    fieldErrors: { errors: [], properties: { [field]: { errors: [message] } } },
    timestamp: Date.now(),
  };
}
