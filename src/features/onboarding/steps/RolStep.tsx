import { scrollFieldIntoView } from '@/lib/utils';
import { ErrorCampo } from '../componentes/ErrorCampo';

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

interface RolStepProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function RolStep({ value, onChange, error }: RolStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Qué rol estás buscando?</h3>
        <p className="text-sm text-on-surface-variant">
          Lo usamos para priorizar ofertas relevantes. Podés escribir el que quieras.
        </p>
      </div>
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
        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
      <ErrorCampo id="error-rol" mensaje={error} />
      <datalist id="roles-sugeridos">
        {ROLES_SUGERIDOS.map((rol) => (
          <option key={rol} value={rol} />
        ))}
      </datalist>
    </div>
  );
}
