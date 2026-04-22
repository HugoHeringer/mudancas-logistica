import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'light' | 'dark' | 'elevated';
  hover?: boolean;
  onClick?: () => void;
}

/**
 * Card Curated Transit — Tonal layering system
 * Uses --surface-container vars from injectBrandCSS (tenant-aware)
 * No hardcoded colors — all derived from tenant branding
 */
export function GlassCard({
  children,
  className,
  style,
  variant = 'light',
  hover = false,
  onClick,
}: GlassCardProps) {
  const variantStyle: React.CSSProperties =
    variant === 'dark'
      ? {
          background: 'color-mix(in srgb, var(--surface-container) 85%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }
      : variant === 'elevated'
      ? {
          background: 'var(--surface-container-lowest)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        }
      : {
          background: 'var(--surface-container-lowest)',
        };

  return (
    <div
      onClick={onClick}
      style={{ ...variantStyle, ...style }}
      className={cn(
        'rounded-xl border transition-all duration-300 ease-out',
        'border-[hsl(var(--border))]',
        hover && 'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:border-[hsl(var(--primary)/0.2)]',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
