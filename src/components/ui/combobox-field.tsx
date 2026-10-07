'use client';

import { getFieldError } from '@/utils/form';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useActionStateContext } from '@/components/ui/action-form';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { FieldError } from '@/components/ui/field-error';
import { Label } from '@/components/ui/label';

export type ComboboxOption = { value: string; label: string };

// Synthetic list entries for "Create '…'" and an extra action such as "Add new family…".
const CREATE_VALUE = '__create__';
const EXTRA_VALUE = '__extra__';

type Props = {
  name: string;
  label: string;
  options: ComboboxOption[];
  multiple?: boolean;
  placeholder?: string;
  // Help text shown under the field and linked with aria-describedby.
  description?: string;
  emptyText?: string;
  // When set, typing a value that doesn't exist offers "Create '<text>'".
  onCreate?: (text: string) => Promise<ComboboxOption | null>;
  extraOption?: { label: string; onSelect: () => void; testId?: string };
  'data-testid'?: string;
};

export function ComboboxField({
  name,
  label,
  options,
  multiple = false,
  placeholder,
  description,
  emptyText = 'No matches',
  onCreate,
  extraOption,
  'data-testid': testId,
}: Props) {
  const actionState = useActionStateContext();
  const { control } = useFormContext();
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = useState('');
  // Options created here, kept so their labels show before the parent's list updates.
  const [created, setCreated] = useState<ComboboxOption[]>([]);

  const known = [...options, ...created.filter((c) => !options.some((o) => o.value === c.value))];
  const query = inputValue.trim();
  const canCreate =
    Boolean(onCreate) &&
    query !== '' &&
    !known.some((o) => o.label.toLocaleLowerCase('en-GB') === query.toLocaleLowerCase('en-GB'));
  const items: ComboboxOption[] = [
    ...known,
    ...(canCreate ? [{ value: CREATE_VALUE, label: `Create '${query}'` }] : []),
    ...(extraOption ? [{ value: EXTRA_VALUE, label: extraOption.label }] : []),
  ];

  const inputId = name;
  const describedBy = [`${name}-error`, description ? `${name}-description` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const clientError = fieldState.error?.message;
        const invalid = Boolean(clientError ?? getFieldError(actionState, name));
        const values: string[] = multiple
          ? ((field.value as string[] | undefined) ?? [])
          : field.value
            ? [field.value as string]
            : [];
        const selected = values
          .map((value) => known.find((option) => option.value === value))
          .filter((option): option is ComboboxOption => Boolean(option));

        const createOption = async () => {
          const option = await onCreate?.(query);
          if (!option) return;
          setCreated((current) => [...current, option]);
          setInputValue('');
          field.onChange(multiple ? [...values, option.value] : option.value);
        };

        const handleChange = (next: ComboboxOption | ComboboxOption[] | null) => {
          const list = Array.isArray(next) ? next : next ? [next] : [];
          if (list.some((option) => option.value === EXTRA_VALUE)) {
            extraOption?.onSelect();
            return;
          }
          if (list.some((option) => option.value === CREATE_VALUE)) {
            void createOption();
            return;
          }
          field.onChange(multiple ? list.map((option) => option.value) : (list[0]?.value ?? ''));
        };

        const inputProps = {
          id: inputId,
          ref: field.ref,
          placeholder,
          'aria-invalid': invalid,
          'aria-describedby': describedBy,
        };

        return (
          <div className="relative grid gap-2" data-testid={testId}>
            <Label htmlFor={inputId}>{label}</Label>
            <Combobox
              items={items}
              multiple={multiple}
              value={multiple ? selected : (selected[0] ?? null)}
              onValueChange={(next) =>
                handleChange(next as ComboboxOption | ComboboxOption[] | null)
              }
              inputValue={inputValue}
              onInputValueChange={setInputValue}
              itemToStringLabel={(option: ComboboxOption) => option.label}
              itemToStringValue={(option: ComboboxOption) => option.value}
              isItemEqualToValue={(a: ComboboxOption, b: ComboboxOption) => a.value === b.value}
              // Keep the synthetic entries visible whatever is typed.
              filter={(option: ComboboxOption, text: string) =>
                option.value.startsWith('__') ||
                option.label.toLocaleLowerCase('en-GB').includes(text.toLocaleLowerCase('en-GB'))
              }
            >
              {multiple ? (
                <ComboboxChips ref={anchor}>
                  <ComboboxValue>
                    {(chips: ComboboxOption[]) =>
                      chips.map((chip) => (
                        <ComboboxChip key={chip.value} showRemove={false}>
                          {chip.label}
                          <ComboboxPrimitive.ChipRemove
                            aria-label={`Remove ${chip.label}`}
                            className="-mr-0.5 rounded-sm opacity-60 hover:opacity-100"
                          >
                            <XIcon className="pointer-events-none size-3" />
                          </ComboboxPrimitive.ChipRemove>
                        </ComboboxChip>
                      ))
                    }
                  </ComboboxValue>
                  <ComboboxChipsInput {...inputProps} />
                </ComboboxChips>
              ) : (
                <ComboboxInput {...inputProps} className="w-full" />
              )}
              <ComboboxContent anchor={multiple ? anchor : undefined}>
                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                <ComboboxList>
                  {(option: ComboboxOption) => (
                    <ComboboxItem
                      key={option.value}
                      value={option}
                      data-testid={option.value === EXTRA_VALUE ? extraOption?.testId : undefined}
                    >
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {/* The submitted values: one hidden input per selected value. */}
            {values.map((value) => (
              <input key={value} type="hidden" name={name} value={value} />
            ))}
            {description ? (
              <p id={`${name}-description`} className="text-muted-foreground text-xs">
                {description}
              </p>
            ) : null}
            <FieldError actionState={actionState} name={name} clientError={clientError} />
          </div>
        );
      }}
    />
  );
}
