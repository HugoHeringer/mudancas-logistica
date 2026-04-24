import { cn } from '../../lib/utils';

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      className={cn('w-20 h-px mx-auto', className)}
      style={{
        background: 'linear-gradient(to right, transparent, var(--brand-accent), transparent)',
      }}
    />
  );
}
