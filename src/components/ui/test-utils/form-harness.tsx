import { type ActionState, EMPTY_FORM_STATE } from '@/utils/form';
import { render } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { renderToString } from 'react-dom/server';
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

// Server-renders the form, lets the "user" type before React hydrates it, then hydrates.
export function hydrateWithTypedValue(ui: React.ReactElement, id: string, typed?: string) {
  const container = document.createElement('div');
  container.innerHTML = renderToString(ui);
  document.body.appendChild(container);
  if (typed !== undefined) {
    const input = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`);
    if (input) input.value = typed;
  }
  return render(ui, { container, hydrate: true });
}
