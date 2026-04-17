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
          ? 'bg-white/50 border-gold/10'
          : 'bg-white/[0.03] border-gold/10',
        hover && 'hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5 hover:border-gold/25',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
