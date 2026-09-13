import { cn } from '@/lib/utils';
import type { Modalidad } from '@/types/oferta';

const OPCIONES: { value: Modalidad; label: string }[] = [
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
];

interface ModalidadStepProps {
  modalidad: Modalidad | null;
  onModalidadChange: (value: Modalidad | null) => void;
  ubicacion: string;
  onUbicacionChange: (value: string) => void;
}

export function ModalidadStep({
  modalidad,
  onModalidadChange,
  ubicacion,
  onUbicacionChange,
}: ModalidadStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Cómo preferís trabajar?</h3>
        <p className="text-sm text-on-surface-variant">Elegí la modalidad que más te sirve y tu ubicación.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {OPCIONES.map((opt) => {
          const active = modalidad === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onModalidadChange(active ? null : opt.value)}
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

      <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
        Ubicación
        <input
          type="text"
          value={ubicacion}
          onChange={(e) => onUbicacionChange(e.target.value)}
          placeholder="Ej: Buenos Aires, Argentina"
          className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </label>
    </div>
  );
}
