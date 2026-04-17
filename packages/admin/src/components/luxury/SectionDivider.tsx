import { cn } from '../../lib/utils';

interface SectionDividerProps {
  className?: string;
}

/**
 * Divisor com gradiente dourado (inspiração Sirocco)
 */
export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      className={cn(
        'w-20 h-px mx-auto',
        'bg-gradient-to-r from-transparent via-gold to-transparent',
        className
      )}
    />
  );
}
