import { TecnologiasEditor } from '../componentes/TecnologiasEditor';

interface StackStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  error?: string | null;
}

export function StackStep({ value, onChange, draft, onDraftChange, error }: StackStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Qué tecnologías te interesan?</h3>
        <p className="text-sm text-on-surface-variant">
          Elegí las que quieras: vamos a priorizar las ofertas que las mencionen. Las ves en la lista de abajo y podés
          quitar las que no quieras.
        </p>
      </div>
      <TecnologiasEditor
        value={value}
        onChange={onChange}
        draft={draft}
        onDraftChange={onDraftChange}
        error={error}
        idError="error-tecnologias"
      />
    </div>
  );
}
