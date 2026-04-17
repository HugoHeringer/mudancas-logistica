import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'gold' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    accent: 'bg-terracotta text-white hover:bg-terracotta/90',
    gold: 'bg-gradient-to-r from-gold to-terracotta text-white hover:shadow-lg hover:shadow-gold/20',
    glass: 'bg-white/[0.08] backdrop-blur-md text-gold-light border border-gold/40 hover:bg-gold/15 hover:border-gold',
  };

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'font-medium tracking-widest uppercase',
        'rounded-sm transition-all duration-300 ease-out',
        'hover:-translate-y-0.5',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
