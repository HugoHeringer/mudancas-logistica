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

/**
 * Card com efeito glassmorphism (inspiração Sirocco)
 * Fundo semi-transparente + backdrop-blur + borda subtil
 */
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
          ? 'bg-card/80 border-border'
          : 'bg-card/40 border-border',
        hover && 'hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/25',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
