import { Input as InputPrimitive } from '@base-ui/react/input';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from 'cn';
import * as React from 'react';

const inputVariants = cva(
  'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 focus-visible:ring-0.5 aria-invalid:ring-0.5 h-10 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default: '',
        flat: 'border-0',
      },
      compact: {
        false: null,
        true: 'h-10 px-2 py-0 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      compact: false,
    },
  }
);

type Props = React.ComponentProps<'input'> & VariantProps<typeof inputVariants>;

function Input({ className, type, variant = 'default', compact, ...props }: Props) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, compact, className }))}
      {...props}
    />
  );
}

export { Input };
