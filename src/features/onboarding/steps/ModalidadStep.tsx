import { scrollFieldIntoView } from '@/lib/utils';
import type { Modalidad } from '@/types/oferta';
import { ErrorCampo } from '../componentes/ErrorCampo';
import { OpcionesElegibles } from '../componentes/OpcionesElegibles';

export const MODALIDADES_ONBOARDING: { value: Modalidad; label: string }[] = [
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
];

interface ModalidadStepProps {
  modalidad: Modalidad | null;
  onModalidadChange: (value: Modalidad | null) => void;
  ubicacion: string;
  onUbicacionChange: (value: string) => void;
  errorModalidad?: string | null;
  errorUbicacion?: string | null;
}

export function ModalidadStep({
  modalidad,
  onModalidadChange,
  ubicacion,
  onUbicacionChange,
  errorModalidad,
  errorUbicacion,
}: ModalidadStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Cómo y dónde querés trabajar?</h3>
        <p className="text-sm text-on-surface-variant">Elegí la modalidad que más te sirve y escribí tu ubicación.</p>
      </div>

      <OpcionesElegibles
        opciones={MODALIDADES_ONBOARDING}
        value={modalidad}
        onChange={onModalidadChange}
        nombre="Modalidad"
        describedBy={errorModalidad ? 'error-modalidad' : undefined}
        invalido={Boolean(errorModalidad)}
      />
      <ErrorCampo id="error-modalidad" mensaje={errorModalidad} />

      <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
        Ubicación
        <input
          type="text"
          maxLength={100}
          value={ubicacion}
          aria-invalid={Boolean(errorUbicacion)}
          aria-describedby={errorUbicacion ? 'error-ubicacion' : undefined}
          onChange={(e) => onUbicacionChange(e.target.value)}
          onFocus={scrollFieldIntoView}
          placeholder="Ej: Buenos Aires, Argentina"
          className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </label>
      <ErrorCampo id="error-ubicacion" mensaje={errorUbicacion} />
    </div>
  );
}
