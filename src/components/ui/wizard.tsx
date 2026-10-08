'use client';

import { cn } from 'cn';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';
import { useActionStateContext } from '@/components/ui/action-form';
import { Button } from '@/components/ui/button';

export type WizardStep = {
  id: string;
  title: string;
  // The form fields on this step: validated before moving on, and used to find the step to show
  // when a submit comes back with errors.
  fields: string[];
  content: React.ReactNode;
};

type Props = {
  steps: WizardStep[];
  // 'linear': only steps already reached can be clicked in the indicator. 'free': any step.
  navigation?: 'linear' | 'free';
  submitLabel: string;
  pending?: boolean;
  // Show the submit button on every step, not just the last (e.g. when editing saved data).
  submitOnEveryStep?: boolean;
  // Rendered under the buttons, e.g. a Cancel link.
  footer?: React.ReactNode;
};

// What to focus once the newly shown step has rendered: its heading, or a field with an error.
type PendingFocus = { kind: 'heading' } | { kind: 'field'; name: string } | null;
type Position = { current: number; furthest: number; focus: PendingFocus };

// Splits an <ActionForm> into steps. Every step stays mounted and inactive ones are `hidden`, so
// all fields are still registered and posted with the form.
export function Wizard({
  steps,
  navigation = 'linear',
  submitLabel,
  pending = false,
  submitOnEveryStep = false,
  footer,
}: Props) {
  const form = useFormContext<FieldValues>();
  const actionState = useActionStateContext();
  const { errors, submitCount } = form.formState;
  // `focus` says what to focus once the step has rendered; a new object each time, so the
  // effect below runs once per move.
  const [position, setPosition] = useState<Position>({ current: 0, furthest: 0, focus: null });
  const { current, furthest } = position;
  // The last submit attempt and server response already handled (see below).
  const [seenSubmitCount, setSeenSubmitCount] = useState(submitCount);
  const [seenActionState, setSeenActionState] = useState(actionState);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const baseId = useId();
  const isLast = current === steps.length - 1;

  const show = (index: number, focus: PendingFocus) => {
    // Already showing it: an error on this step is focused by the form itself.
    if (index === current) return;
    setPosition((value) => ({ current: index, furthest: Math.max(value.furthest, index), focus }));
  };

  // The first step with an error in any of these fields, and that field.
  const errorTarget = (names: string[]): [number, PendingFocus] | null => {
    const index = steps.findIndex((step) => step.fields.some((field) => names.includes(field)));
    if (index < 0) return null;
    const name = steps[index].fields.find((field) => names.includes(field)) ?? names[0];
    return [index, { kind: 'field', name }];
  };

  // A failed submit, client- or server-side: show the first step with an error and focus that
  // field, since the form's own focus-on-error can't reach a field on a hidden step. Handled
  // while rendering so the step is shown in the same pass.
  if (submitCount !== seenSubmitCount) {
    setSeenSubmitCount(submitCount);
    const target = errorTarget(Object.keys(errors));
    if (target) show(...target);
  }
  if (actionState !== seenActionState) {
    setSeenActionState(actionState);
    const target =
      actionState.status === 'ERROR'
        ? errorTarget(Object.keys(actionState.fieldErrors.properties ?? {}))
        : null;
    if (target) show(...target);
  }

  useEffect(() => {
    const { focus } = position;
    if (focus?.kind === 'heading') headingRefs.current[position.current]?.focus();
    if (focus?.kind === 'field') form.setFocus(focus.name);
  }, [position, form]);

  // Moving forward checks every step being passed; it stops on the first one with an error.
  const goTo = async (target: number) => {
    if (target < current) return show(target, { kind: 'heading' });

    for (let index = current; index < target; index++) {
      const valid = await form.trigger(steps[index].fields as Path<FieldValues>[], {
        shouldFocus: index === current,
      });
      if (!valid) return show(index, { kind: 'heading' });
    }
    show(target, { kind: 'heading' });
  };

  // Enter in a text field submits the form natively; before the last step, go to the next one.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (event.key !== 'Enter' || event.defaultPrevented || isLast) return;
    if (!(target instanceof HTMLInputElement) || NON_TEXT_INPUTS.has(target.type)) return;
    // An open combobox uses Enter to pick the highlighted option.
    if (target.getAttribute('aria-expanded') === 'true') return;
    event.preventDefault();
    void goTo(current + 1);
  };

  const isReachable = (index: number) => navigation === 'free' || index <= furthest;

  return (
    <div className="flex flex-col gap-6" onKeyDown={handleKeyDown} data-testid="wizard">
      <nav aria-label="Form steps" className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm" data-testid="wizard-progress">
          Step {current + 1} of {steps.length}
        </p>
        <ol className="flex items-start gap-2">
          {steps.map((step, index) => {
            const isCurrent = index === current;
            const isDone = index < furthest && !isCurrent;
            const marker = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isDone && 'border-primary text-primary',
                    !isCurrent && !isDone && 'text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'text-center text-xs leading-tight max-sm:sr-only',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                  {isDone ? <span className="sr-only"> (completed)</span> : null}
                </span>
              </>
            );
            const itemClass = 'flex w-full flex-col items-center gap-1 rounded-md p-1';

            return (
              <li
                key={step.id}
                className="flex flex-1"
                aria-current={isCurrent ? 'step' : undefined}
                data-testid={`wizard-step-${step.id}`}
              >
                {isReachable(index) && !isCurrent ? (
                  <button
                    type="button"
                    className={cn(
                      itemClass,
                      'hover:bg-muted focus-visible:ring-ring/50 outline-none focus-visible:ring-3'
                    )}
                    onClick={() => void goTo(index)}
                  >
                    {marker}
                  </button>
                ) : (
                  <div className={itemClass}>{marker}</div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {steps.map((step, index) => {
        const headingId = `${baseId}-${step.id}`;

        return (
          <section
            key={step.id}
            aria-labelledby={headingId}
            hidden={index !== current}
            className="flex flex-col gap-6"
            data-testid={`wizard-panel-${step.id}`}
          >
            <h3
              id={headingId}
              ref={(element) => {
                headingRefs.current[index] = element;
              }}
              tabIndex={-1}
              className="font-heading text-base font-medium outline-none"
            >
              {step.title}
            </h3>
            {step.content}
          </section>
        );
      })}

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          {current > 0 ? (
            <Button
              key="prev"
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => void goTo(current - 1)}
              data-testid="wizard-prev"
            >
              <ChevronLeft />
              Previous
            </Button>
          ) : null}
          {isLast ? (
            <Button key="submit" type="submit" className="flex-1" disabled={pending}>
              {submitLabel}
            </Button>
          ) : (
            <Button
              key="next"
              type="button"
              className="flex-1"
              onClick={() => void goTo(current + 1)}
              data-testid="wizard-next"
            >
              Next
              <ChevronRight />
            </Button>
          )}
        </div>
        {submitOnEveryStep && !isLast ? (
          <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
            {submitLabel}
          </Button>
        ) : null}
        {footer}
      </div>
    </div>
  );
}

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'file']);
