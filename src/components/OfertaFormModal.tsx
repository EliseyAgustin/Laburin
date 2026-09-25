import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { FUENTE_MANUAL } from '@/lib/fuentes';
import type { Modalidad, Oferta, OfertaInput } from '@/types/oferta';

interface OfertaFormModalProps {
  oferta?: Oferta | null;
  onClose: () => void;
  onSubmit: (input: OfertaInput) => Promise<void>;
}

const MODALIDADES: { value: Modalidad; label: string }[] = [
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
];

export function OfertaFormModal({ oferta, onClose, onSubmit }: OfertaFormModalProps) {
  const isEditing = Boolean(oferta);

  const [empresa, setEmpresa] = useState(oferta?.empresa ?? '');
  const [rol, setRol] = useState(oferta?.rol ?? '');
  const [ubicacion, setUbicacion] = useState(oferta?.ubicacion ?? '');
  const [modalidad, setModalidad] = useState<Modalidad | ''>(oferta?.modalidad ?? '');
  const [fechaPublicacion, setFechaPublicacion] = useState(oferta?.fecha_publicacion ?? '');
  const [stack, setStack] = useState<string[]>(oferta?.stack_tecnologico ?? []);
  const [stackDraft, setStackDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addStackItem() {
    const value = stackDraft.trim();
    if (value && !stack.includes(value)) {
      setStack([...stack, value]);
    }
    setStackDraft('');
  }

  function handleStackKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addStackItem();
    } else if (e.key === 'Backspace' && stackDraft === '' && stack.length > 0) {
      setStack(stack.slice(0, -1));
    }
  }

  function removeStackItem(item: string) {
    setStack(stack.filter((s) => s !== item));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!empresa.trim() || !rol.trim()) {
      setError('Empresa y rol son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        empresa: empresa.trim(),
        rol: rol.trim(),
        ubicacion: ubicacion.trim() || null,
        modalidad: modalidad || null,
        stack_tecnologico: stack,
        fuente: oferta?.fuente ?? FUENTE_MANUAL,
        fecha_publicacion: fechaPublicacion || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la oferta.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.4)]">
      <div className="w-full max-w-128 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-lg font-heading font-semibold text-on-surface">
            {isEditing ? 'Editar oferta' : 'Nueva oferta'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
              Empresa *
              <input
                type="text"
                required
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
              Rol *
              <input
                type="text"
                required
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
              Ubicación
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: CABA, Argentina"
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
              Modalidad
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value as Modalidad | '')}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                <option value="">Sin especificar</option>
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
              Fecha de publicación
              <input
                type="date"
                value={fechaPublicacion ?? ''}
                onChange={(e) => setFechaPublicacion(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
            Stack tecnológico
            <div className="flex flex-wrap gap-2 bg-surface border border-outline-variant rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              {stack.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-medium px-2 py-1 rounded-md border border-outline-variant"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeStackItem(item)}
                    className="hover:text-error cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={stackDraft}
                onChange={(e) => setStackDraft(e.target.value)}
                onKeyDown={handleStackKeyDown}
                onBlur={addStackItem}
                placeholder={stack.length === 0 ? 'React, SQL… (Enter para agregar)' : ''}
                className="flex-1 min-w-24 bg-transparent text-on-surface text-sm outline-none"
              />
            </div>
          </label>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-on-primary text-sm font-medium px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
