import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  help: string;
  action?: ReactNode;
}

export function PageHeader({ title, help, action }: PageHeaderProps) {
  return (
    <div className="pb-2 border-b border-outline-variant flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-4xl font-heading font-bold tracking-tight text-on-surface">{title}</h1>
        <p className="text-base text-on-surface-variant mt-1">{help}</p>
      </div>
      {action}
    </div>
  );
}
