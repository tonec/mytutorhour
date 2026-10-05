import { ZodError, z } from 'zod';

export type LooseErrorTree = {
  errors: string[];
  properties?: Record<string, LooseErrorTree>;
};

export type ActionState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: string;
  fieldErrors: LooseErrorTree;
  timestamp: number;
  payload?: Record<string, string>;
};

export const EMPTY_FORM_STATE: ActionState = {
  status: 'UNSET',
  message: '',
  fieldErrors: { errors: [] },
  timestamp: Date.now(),
};

export const getFieldError = (formState: ActionState, name: string) =>
  formState.fieldErrors.properties?.[name]?.errors?.[0];

export const fromErrorToFormState = (
  error: unknown,
  payload?: Record<string, string>
): ActionState => {
  if (error instanceof ZodError) {
    return {
      status: 'ERROR',
      message: '',
      fieldErrors: z.treeifyError(error),
      timestamp: Date.now(),
      payload,
    };
  }

  return { ...EMPTY_FORM_STATE, payload };
};

export const toFormState = (
  status: ActionState['status'],
  message: string,
  payload?: Record<string, string>
): ActionState => {
  return {
    status,
    message,
    fieldErrors: { errors: [] },
    timestamp: Date.now(),
    payload,
  };
};
