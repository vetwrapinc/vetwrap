import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/30',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/10',
        outline: 'border border-white/20 bg-transparent text-slate-100 hover:bg-white/10',
        ghost: 'hover:bg-white/10 hover:text-white text-slate-300',
        destructive: 'bg-rose-600 text-white hover:bg-rose-500'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-6',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { className, variant, size, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...rest} />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
