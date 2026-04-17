import { type ReactNode } from 'react';
import { useScrollReveal } from '../../hooks/use-scroll-reveal';
import { cn } from '../../lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  direction = 'up',
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        direction === 'up' && 'reveal',
        direction === 'left' && 'reveal-left',
        direction === 'right' && 'reveal-right',
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
