import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — Curated Transit
 * Usado em todas as páginas para consistência visual.
 * Usa vars do tenant via CSS, nunca cores hardcoded.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8', className)}>
      <div>
        <h2
          className="text-2xl font-light tracking-tight"
          style={{
            fontFamily: 'var(--tenant-font-display)',
            color: 'hsl(var(--foreground))',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-1 text-sm"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
