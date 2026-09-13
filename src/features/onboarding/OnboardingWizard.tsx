import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completarOnboarding, omitirOnboarding } from '@/services/onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { Modalidad } from '@/types/oferta';
import type { Seniority } from '@/types/perfilUsuario';
import { RolStep } from './steps/RolStep';
import { StackStep } from './steps/StackStep';
import { ModalidadStep } from './steps/ModalidadStep';
import { SeniorityStep } from './steps/SeniorityStep';

const TOTAL_STEPS = 4;

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { refresh } = useOnboarding();

  const [step, setStep] = useState(1);
  const [rolBuscado, setRolBuscado] = useState('');
  const [stackInteres, setStackInteres] = useState<string[]>([]);
  const [modalidad, setModalidad] = useState<Modalidad | null>(null);
  const [ubicacion, setUbicacion] = useState('');
  const [seniority, setSeniority] = useState<Seniority | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      await completarOnboarding({
        rol_buscado: rolBuscado.trim() || null,
        stack_interes: stackInteres,
        modalidad_preferida: modalidad,
        ubicacion: ubicacion.trim() || null,
        seniority,
      });
      await refresh();
      navigate('/tablero', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar tu perfil.');
      setSaving(false);
    }
  }

  async function skip() {
    setSaving(true);
    setError(null);
    try {
      await omitirOnboarding();
      await refresh();
      navigate('/tablero', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo omitir el onboarding.');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-margin">
      <div className="w-full max-w-128 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
            <span>
              Paso {step} de {TOTAL_STEPS}
            </span>
            <button
              type="button"
              onClick={skip}
              disabled={saving}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Omitir por ahora
            </button>
          </div>
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && <RolStep value={rolBuscado} onChange={setRolBuscado} />}
        {step === 2 && <StackStep value={stackInteres} onChange={setStackInteres} />}
        {step === 3 && (
          <ModalidadStep
            modalidad={modalidad}
            onModalidadChange={setModalidad}
            ubicacion={ubicacion}
            onUbicacionChange={setUbicacion}
          />
        )}
        {step === 4 && <SeniorityStep value={seniority} onChange={setSeniority} />}

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || saving}
            className="px-4 py-2 rounded-lg text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-0"
          >
            Atrás
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Finalizar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
