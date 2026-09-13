import { cn } from '@/lib/utils';
import type { Seniority } from '@/types/perfilUsuario';

const OPCIONES: { value: Seniority; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'semi_senior', label: 'Semi Senior' },
  { value: 'senior', label: 'Senior' },
];

interface SeniorityStepProps {
  value: Seniority | null;
  onChange: (value: Seniority | null) => void;
}

export function SeniorityStep({ value, onChange }: SeniorityStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Cuál es tu nivel de seniority?</h3>
        <p className="text-sm text-on-surface-variant">Opcional — podés dejarlo sin marcar.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {OPCIONES.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(active ? null : opt.value)}
              className={cn(
                'rounded-lg border p-4 text-center text-sm font-medium transition-colors cursor-pointer',
                active
                  ? 'border-primary bg-primary-container text-on-primary-container'
                  : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
