'use client';

import { getFieldError } from '@/utils/form';
import { Controller, useFormContext } from 'react-hook-form';
import { useActionStateContext } from '@/components/ui/action-form';
import { FieldError } from '@/components/ui/field-error';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Option = { value: string; label: string };

type Props = {
  name: string;
  label: string;
  options: Option[];
  // Return false to stop the change, e.g. to confirm it first and apply it later with setValue.
  onRequestChange?: (value: string) => boolean;
  'data-testid'?: string;
};

export function RadioGroupField({
  name,
  label,
  options,
  onRequestChange,
  'data-testid': testId,
}: Props) {
  const actionState = useActionStateContext();
  const { control } = useFormContext();
  const labelId = `${name}-label`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const clientError = fieldState.error?.message;

        return (
          <div className="relative grid gap-2">
            <span id={labelId} className="text-sm leading-none font-medium">
              {label}
            </span>
            <RadioGroup
              ref={(element: HTMLDivElement | null) =>
                // Let react-hook-form focus the group (it focuses the selected or first radio).
                field.ref({
                  focus: () =>
                    (
                      element?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]') ??
                      element?.querySelector<HTMLElement>('[role="radio"]')
                    )?.focus(),
                })
              }
              name={name}
              value={field.value}
              onValueChange={(value) => {
                const next = String(value);
                if (onRequestChange && !onRequestChange(next)) return;
                field.onChange(next);
              }}
              aria-labelledby={labelId}
              aria-invalid={Boolean(clientError ?? getFieldError(actionState, name))}
              aria-describedby={`${name}-error`}
              className="flex flex-wrap gap-6"
              data-testid={testId}
            >
              {options.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={option.value} />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
            <FieldError actionState={actionState} name={name} clientError={clientError} />
          </div>
        );
      }}
    />
  );
}
