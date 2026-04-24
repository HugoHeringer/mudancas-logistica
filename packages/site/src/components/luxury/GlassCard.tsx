import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'light' | 'dark';
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  style,
  variant = 'light',
  hover = false,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-xl backdrop-blur-md border transition-all duration-500 ease-out',
        variant === 'light'
          ? 'glass-brand-light'
          : 'glass-brand-dark',
        hover && 'hover:-translate-y-1 hover:shadow-lg hover:border-[color-mix(in_srgb,var(--brand-accent)_25%,transparent)]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
