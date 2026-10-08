import { cn } from '@/lib/utils';

interface OpcionesElegiblesProps<T extends string> {
  opciones: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  nombre: string;
  describedBy?: string;
  invalido?: boolean;
}

// Botones de elección única (modalidad, nivel de experiencia). Volver a tocar la opción elegida la desmarca.
export function OpcionesElegibles<T extends string>({
  opciones,
  value,
  onChange,
  nombre,
  describedBy,
  invalido,
}: OpcionesElegiblesProps<T>) {
  return (
    <div role="group" aria-label={nombre} aria-describedby={describedBy} className="grid grid-cols-3 gap-3">
      {opciones.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : opt.value)}
            className={cn(
              'rounded-lg border px-2 py-4 md:p-4 text-center text-xs md:text-sm font-medium transition-colors cursor-pointer',
              active
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary',
              invalido && !active && 'border-error'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
