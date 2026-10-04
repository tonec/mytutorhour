import { ZodError, z } from 'zod';

export type LooseErrorTree = {
  errors: string[];
  properties?: Record<string, LooseErrorTree>;
};

export type FormState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: string;
  fieldErrors: LooseErrorTree;
  timestamp: number;
};

export const EMPTY_FORM_STATE: FormState = {
  status: 'UNSET',
  message: '',
  fieldErrors: { errors: [] },
  timestamp: Date.now(),
};

export const fromErrorToFormState = (error: unknown): FormState => {
  if (error instanceof ZodError) {
    return {
      status: 'ERROR',
      message: '',
      fieldErrors: z.treeifyError(error),
      timestamp: Date.now(),
    };
  }

  return EMPTY_FORM_STATE;
};

export const toFormState = (status: FormState['status'], message: string): FormState => {
  return {
    status,
    message,
    fieldErrors: { errors: [] },
    timestamp: Date.now(),
  };
};
