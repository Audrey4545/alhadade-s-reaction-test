import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = true, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-street uppercase tracking-wider transition-all duration-200 active:scale-95',
          'border-2 rounded-lg font-bold',
          // Variants
          variant === 'primary' && 'bg-primary text-primary-foreground border-primary hover:bg-primary/80',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
          variant === 'danger' && 'bg-street-red text-foreground border-street-red hover:bg-street-red/80',
          variant === 'success' && 'bg-success text-foreground border-success hover:bg-success/80',
          // Sizes
          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-6 py-3 text-lg',
          size === 'lg' && 'px-8 py-4 text-xl',
          size === 'xl' && 'px-12 py-6 text-2xl min-h-[80px]',
          // Glow
          glow && variant === 'primary' && 'hover:box-glow',
          glow && variant === 'success' && 'hover:box-glow-success',
          glow && variant === 'danger' && 'hover:box-glow-danger',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GameButton.displayName = 'GameButton';

export default GameButton;
