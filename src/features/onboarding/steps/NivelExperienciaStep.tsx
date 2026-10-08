import type { Seniority } from '@/types/perfilUsuario';
import { OpcionesElegibles } from '../componentes/OpcionesElegibles';

export const NIVELES_EXPERIENCIA: { value: Seniority; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'semi_senior', label: 'Semi Senior' },
  { value: 'senior', label: 'Senior' },
];

interface NivelExperienciaStepProps {
  value: Seniority | null;
  onChange: (value: Seniority | null) => void;
}

export function NivelExperienciaStep({ value, onChange }: NivelExperienciaStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Cuál es tu nivel de experiencia?</h3>
        <p className="text-sm text-on-surface-variant">Es opcional: podés dejarlo sin marcar.</p>
      </div>
      <OpcionesElegibles opciones={NIVELES_EXPERIENCIA} value={value} onChange={onChange} nombre="Nivel de experiencia" />
    </div>
  );
}
