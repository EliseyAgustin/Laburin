import { useEffect, useState, type FormEvent } from 'react';
import { Timer, Terminal, Briefcase, MapPin, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { mensajeDeError } from '@/lib/errores';
import { cn } from '@/lib/utils';
import {
  actualizarCriterio,
  construirCriterio,
  crearCriterio,
  eliminarCriterio,
  listarCriterios,
  MODALIDAD_LABEL,
} from '@/services/criteriosScoring';
import type { CriterioScoring } from '@/types/criterioScoring';
import type { Modalidad } from '@/types/oferta';

const MODALIDADES: { value: Modalidad; label: string }[] = [
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
];

function ToggleActivo({
  activo,
  onClick,
  disabled,
}: {
  activo: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const Icon = activo ? ToggleRight : ToggleLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={activo ? 'Desactivar criterio' : 'Activar criterio'}
      title={activo ? 'Activo' : 'Inactivo'}
      className={cn(
        'p-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer',
        activo ? 'text-primary' : 'text-on-surface-variant'
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

export function Settings() {
  const [criterios, setCriterios] = useState<CriterioScoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const [stackDraft, setStackDraft] = useState('');
  const [stackPesoDraft, setStackPesoDraft] = useState('10');
  const [modalidadDraft, setModalidadDraft] = useState<Modalidad | ''>('');
  const [modalidadPesoDraft, setModalidadPesoDraft] = useState('10');
  const [ubicacionDraft, setUbicacionDraft] = useState('');
  const [ubicacionPesoDraft, setUbicacionPesoDraft] = useState('10');

  useEffect(() => {
    refetch();
  }, []);

  async function refetch() {
    setLoading(true);
    try {
      const data = await listarCriterios();
      setCriterios(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(mensajeDeError(err, 'No se pudieron cargar los criterios.'));
    } finally {
      setLoading(false);
    }
  }

  function marcarGuardando(id: string, guardando: boolean) {
    setSavingIds((prev) => {
      const next = new Set(prev);
      if (guardando) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handlePesoChange(id: string, valor: string) {
    const peso = Number(valor);
    setCriterios((prev) => prev.map((c) => (c.id === id ? { ...c, peso: Number.isNaN(peso) ? c.peso : peso } : c)));
  }

  async function handlePesoBlur(criterio: CriterioScoring, valorOriginal: number) {
    if (criterio.peso === valorOriginal || Number.isNaN(criterio.peso)) return;

    marcarGuardando(criterio.id, true);
    try {
      const actualizado = await actualizarCriterio(criterio.id, { peso: criterio.peso });
      setCriterios((prev) => prev.map((c) => (c.id === actualizado.id ? actualizado : c)));
      setActionError(null);
    } catch (err) {
      setActionError(mensajeDeError(err, 'No se pudo actualizar el peso.'));
      await refetch();
    } finally {
      marcarGuardando(criterio.id, false);
    }
  }

  async function handleToggleActivo(criterio: CriterioScoring) {
    marcarGuardando(criterio.id, true);
    try {
      const actualizado = await actualizarCriterio(criterio.id, { activo: !criterio.activo });
      setCriterios((prev) => prev.map((c) => (c.id === actualizado.id ? actualizado : c)));
      setActionError(null);
    } catch (err) {
      setActionError(mensajeDeError(err, 'No se pudo actualizar el criterio.'));
    } finally {
      marcarGuardando(criterio.id, false);
    }
  }

  async function handleDelete(criterio: CriterioScoring) {
    if (!window.confirm(`¿Eliminar el criterio "${criterio.nombre}"?`)) return;

    marcarGuardando(criterio.id, true);
    try {
      await eliminarCriterio(criterio.id);
      setCriterios((prev) => prev.filter((c) => c.id !== criterio.id));
      setActionError(null);
    } catch (err) {
      setActionError(mensajeDeError(err, 'No se pudo eliminar el criterio.'));
      marcarGuardando(criterio.id, false);
    }
  }

  async function handleAddStack(e: FormEvent) {
    e.preventDefault();
    const valor = stackDraft.trim();
    const peso = Number(stackPesoDraft);
    if (!valor || Number.isNaN(peso)) return;

    try {
      const nuevo = await crearCriterio(construirCriterio('stack', valor, peso));
      setCriterios((prev) => [...prev, nuevo]);
      setStackDraft('');
      setStackPesoDraft('10');
      setActionError(null);
    } catch (err) {
      setActionError(mensajeDeError(err, 'No se pudo crear el criterio.'));
    }
  }

  async function handleAddModalidad(e: FormEvent) {
    e.preventDefault();
    const peso = Number(modalidadPesoDraft);
    if (!modalidadDraft || Number.isNaN(peso)) return;

    try {
      const nuevo = await crearCriterio(construirCriterio('modalidad', modalidadDraft, peso));
      setCriterios((prev) => [...prev, nuevo]);
      setModalidadDraft('');
      setModalidadPesoDraft('10');
      setActionError(null);
    } catch (err) {
      setActionError(mensajeDeError(err, 'No se pudo crear el criterio.'));
    }
  }

  async function handleAddUbicacion(e: FormEvent) {
    e.preventDefault();
    const valor = ubicacionDraft.trim();
    const peso = Number(ubicacionPesoDraft);
    if (!valor || Number.isNaN(peso)) return;

    try {
      const nuevo = await crearCriterio(construirCriterio('ubicacion', valor, peso));
      setCriterios((prev) => [...prev, nuevo]);
      setUbicacionDraft('');
      setUbicacionPesoDraft('10');
      setActionError(null);
    } catch (err) {
      setActionError(mensajeDeError(err, 'No se pudo crear el criterio.'));
    }
  }

  const stackCriterios = criterios.filter((c) => c.campo_objetivo === 'stack_tecnologico');
  const modalidadCriterios = criterios.filter((c) => c.campo_objetivo === 'modalidad');
  const ubicacionCriterios = criterios.filter((c) => c.campo_objetivo === 'ubicacion');
  const modalidadesDisponibles = MODALIDADES.filter(
    (m) => !modalidadCriterios.some((c) => c.valor_comparacion === m.value)
  );

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-margin min-h-full">
        <div className="max-w-7xl mx-auto text-center text-on-surface-variant text-sm py-16">
          Cargando criterios de scoring…
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-margin min-h-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-6">
        {/* Page Header */}
        <div className="pb-2 border-b border-outline-variant">
          <h1 className="text-4xl font-heading font-bold tracking-tight text-on-surface">Motor de Scoring</h1>
          <p className="text-base text-on-surface-variant mt-1">
            Ajusta los pesos y criterios para la evaluación automática de candidatos. Los cambios se guardan y
            recalculan al instante.
          </p>
        </div>

        {loadError && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">{loadError}</div>
        )}
        {actionError && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">{actionError}</div>
        )}

        {/* Global Settings Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-semibold text-on-surface">Umbral de Inactividad</h3>
              <p className="text-sm text-on-surface-variant">Días antes de considerar una oferta o candidato inactivo.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              defaultValue="30"
              className="w-20 text-center text-xl font-semibold text-on-surface bg-surface border border-outline-variant rounded-lg px-2 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-on-surface-variant">días</span>
          </div>
        </div>

        {/* Bento Grid Layout for Scoring Criteria */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* STACK: Keywords & Weights */}
          <section className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-125">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface rounded-t-xl">
              <div className="flex items-center gap-2">
                <Terminal className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-heading font-semibold text-on-surface">Stack Tecnológico</h2>
              </div>
              <span className="bg-primary-container text-on-primary-container text-[11px] font-semibold px-2 py-1 rounded-full">
                Alto Impacto
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-2 px-4 pb-2 border-b border-outline-variant text-xs font-medium text-on-surface-variant">
                <div className="col-span-6">Keyword / Tecnología</div>
                <div className="col-span-3 text-center">Peso (Pts)</div>
                <div className="col-span-1 text-center">Activo</div>
                <div className="col-span-2"></div>
              </div>

              {stackCriterios.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-6">
                  Todavía no agregaste criterios de stack.
                </p>
              )}

              {stackCriterios.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'grid grid-cols-12 gap-2 items-center p-4 rounded-lg hover:bg-surface-container-low transition-colors group',
                    !c.activo && 'opacity-50'
                  )}
                >
                  <div className="col-span-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container border border-outline-variant rounded-md text-xs font-medium text-on-surface">
                      {c.valor_comparacion}
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <input
                      type="number"
                      value={c.peso}
                      disabled={savingIds.has(c.id)}
                      onChange={(e) => handlePesoChange(c.id, e.target.value)}
                      onBlur={() => handlePesoBlur(c, c.peso)}
                      className="w-16 text-center text-sm text-on-surface bg-transparent border-b border-outline-variant focus:border-primary focus:outline-none pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <ToggleActivo
                      activo={c.activo}
                      disabled={savingIds.has(c.id)}
                      onClick={() => handleToggleActivo(c)}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={savingIds.has(c.id)}
                      onClick={() => handleDelete(c)}
                      className="text-error hover:bg-error-container p-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New */}
            <form onSubmit={handleAddStack} className="p-4 border-t border-outline-variant bg-surface-bright rounded-b-xl">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={stackDraft}
                  onChange={(e) => setStackDraft(e.target.value)}
                  placeholder="Nueva tecnología..."
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <input
                  type="number"
                  value={stackPesoDraft}
                  onChange={(e) => setStackPesoDraft(e.target.value)}
                  placeholder="Peso"
                  className="w-24 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="submit"
                  className="bg-surface-container-low text-primary border border-outline-variant hover:border-primary hover:bg-surface-container transition-colors rounded-lg p-2 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>
          </section>

          {/* Column for Modalidad & Ubicación */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* MODALIDAD */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
              <div className="p-4 border-b border-outline-variant bg-surface rounded-t-xl flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-tertiary" />
                <h2 className="text-xl font-heading font-semibold text-on-surface">Modalidad</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {modalidadCriterios.length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-2">
                    Todavía no agregaste criterios de modalidad.
                  </p>
                )}

                {modalidadCriterios.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      'flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-container-low transition-colors group',
                      !c.activo && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                      {MODALIDAD_LABEL[c.valor_comparacion as Modalidad] ?? c.valor_comparacion}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 bg-surface border border-outline-variant rounded-md px-2 py-1 focus-within:border-primary">
                        <input
                          type="number"
                          value={c.peso}
                          disabled={savingIds.has(c.id)}
                          onChange={(e) => handlePesoChange(c.id, e.target.value)}
                          onBlur={() => handlePesoBlur(c, c.peso)}
                          className="w-10 text-center text-xs font-medium text-primary bg-transparent border-none p-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-outline text-xs">pts</span>
                      </div>
                      <ToggleActivo
                        activo={c.activo}
                        disabled={savingIds.has(c.id)}
                        onClick={() => handleToggleActivo(c)}
                      />
                      <button
                        type="button"
                        disabled={savingIds.has(c.id)}
                        onClick={() => handleDelete(c)}
                        className="text-error hover:bg-error-container p-1 rounded-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {modalidadesDisponibles.length > 0 && (
                  <form onSubmit={handleAddModalidad} className="flex items-center gap-2 pt-2 border-t border-outline-variant mt-1">
                    <select
                      value={modalidadDraft}
                      onChange={(e) => setModalidadDraft(e.target.value as Modalidad | '')}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:border-primary focus:outline-none cursor-pointer"
                    >
                      <option value="">Elegir modalidad…</option>
                      {modalidadesDisponibles.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={modalidadPesoDraft}
                      onChange={(e) => setModalidadPesoDraft(e.target.value)}
                      placeholder="Pts"
                      className="w-16 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:border-primary focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="submit"
                      className="bg-surface-container-low text-primary border border-outline-variant rounded-lg px-2 py-2 hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </section>

            {/* UBICACIÓN */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex-1 flex flex-col">
              <div className="p-4 border-b border-outline-variant bg-surface rounded-t-xl flex items-center gap-2">
                <MapPin className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-heading font-semibold text-on-surface">Ubicación</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {ubicacionCriterios.length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-2">
                    Todavía no agregaste criterios de ubicación.
                  </p>
                )}

                {ubicacionCriterios.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      'flex items-center justify-between gap-2 p-2 rounded-lg border border-outline-variant bg-surface-bright group',
                      !c.activo && 'opacity-50'
                    )}
                  >
                    <span className="text-sm text-on-surface">{c.valor_comparacion}</span>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 bg-surface border border-outline-variant rounded-md px-2 py-1">
                        <span className="text-outline text-xs">+</span>
                        <input
                          type="number"
                          value={c.peso}
                          disabled={savingIds.has(c.id)}
                          onChange={(e) => handlePesoChange(c.id, e.target.value)}
                          onBlur={() => handlePesoBlur(c, c.peso)}
                          className="w-10 text-center text-xs font-medium text-on-secondary-container bg-transparent border-none p-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-outline text-xs">pts</span>
                      </div>
                      <ToggleActivo
                        activo={c.activo}
                        disabled={savingIds.has(c.id)}
                        onClick={() => handleToggleActivo(c)}
                      />
                      <button
                        type="button"
                        disabled={savingIds.has(c.id)}
                        onClick={() => handleDelete(c)}
                        className="text-error hover:bg-error-container p-1 rounded-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddUbicacion} className="p-2 border-t border-outline-variant bg-surface rounded-b-xl flex gap-2">
                <input
                  type="text"
                  value={ubicacionDraft}
                  onChange={(e) => setUbicacionDraft(e.target.value)}
                  placeholder="Ej: Zona Norte"
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  value={ubicacionPesoDraft}
                  onChange={(e) => setUbicacionPesoDraft(e.target.value)}
                  placeholder="Pts"
                  className="w-16 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:border-primary focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="submit"
                  className="bg-surface-container-low text-primary border border-outline-variant rounded-lg px-2 py-2 hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
