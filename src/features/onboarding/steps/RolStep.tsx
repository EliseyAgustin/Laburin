import { scrollFieldIntoView } from '@/lib/utils';
import { ErrorCampo } from '../componentes/ErrorCampo';
import { AvisoPrivacidad } from '@/components/AvisoPrivacidad';

export const ROLES_SUGERIDOS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'QA Automation',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'UX/UI Designer',
  'DevOps Engineer',
  'Mobile Developer',
];

const CLASE_INPUT =
  'w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all';

interface RolStepProps {
  nombre: string;
  onNombreChange: (value: string) => void;
  errorNombre?: string | null;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function RolStep({ nombre, onNombreChange, errorNombre, value, onChange, error }: RolStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">Contanos quién sos y qué buscás</h3>
        <p className="text-sm text-on-surface-variant">
          Usamos el rol para priorizar ofertas relevantes. Podés escribir el que quieras.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-on-surface">
        ¿Cómo te llamás?
        <input
          type="text"
          maxLength={100}
          autoComplete="name"
          value={nombre}
          aria-invalid={Boolean(errorNombre)}
          aria-describedby={errorNombre ? 'error-nombre' : undefined}
          onChange={(e) => onNombreChange(e.target.value)}
          onFocus={scrollFieldIntoView}
          placeholder="Ej: Ana Gómez"
          className={CLASE_INPUT}
        />
      </label>
      <ErrorCampo id="error-nombre" mensaje={errorNombre} />

      <label className="flex flex-col gap-1.5 text-sm font-medium text-on-surface">
        ¿Qué rol estás buscando?
        <input
          list="roles-sugeridos"
          type="text"
          maxLength={100}
          value={value}
          aria-label="Rol que buscás"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'error-rol' : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={scrollFieldIntoView}
          placeholder="Ej: Frontend Developer"
          className={CLASE_INPUT}
        />
      </label>
      <ErrorCampo id="error-rol" mensaje={error} />
      <datalist id="roles-sugeridos">
        {ROLES_SUGERIDOS.map((rol) => (
          <option key={rol} value={rol} />
        ))}
      </datalist>

      <AvisoPrivacidad />
    </div>
  );
}
