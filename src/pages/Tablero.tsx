import { useEffect, useState, type DragEvent } from 'react';
import { Building2, Clock, Inbox, Trash2 } from 'lucide-react';
import { cn, scoreBorderClasses } from '@/lib/utils';
import {
  actualizarEstadoPostulacion,
  eliminarPostulacion,
  ESTADOS_POSTULACION,
  listarPostulacionesConOferta,
} from '@/services/postulaciones';
import type { EstadoPostulacion, PostulacionConOferta } from '@/types/postulacion';

export function Tablero() {
  const [postulaciones, setPostulaciones] = useState<PostulacionConOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverEstado, setDragOverEstado] = useState<EstadoPostulacion | null>(null);

  useEffect(() => {
    refetch();
  }, []);

  async function refetch() {
    setLoading(true);
    try {
      const data = await listarPostulacionesConOferta();
      setPostulaciones(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar las postulaciones.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postulacion: PostulacionConOferta) {
    if (!window.confirm(`¿Dejar de trackear la postulación a "${postulacion.oferta.rol}"?`)) return;

    try {
      await eliminarPostulacion(postulacion.id);
      setPostulaciones((prev) => prev.filter((p) => p.id !== postulacion.id));
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo eliminar la postulación.');
    }
  }

  function handleDragStart(e: DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverEstado(null);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, estado: EstadoPostulacion) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEstado(estado);
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>, estado: EstadoPostulacion) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setDraggingId(null);
    setDragOverEstado(null);

    const postulacion = postulaciones.find((p) => p.id === id);
    if (!postulacion || postulacion.estado === estado) return;

    const estadoAnterior = postulacion.estado;
    setPostulaciones((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));

    try {
      await actualizarEstadoPostulacion(id, estado);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
      setPostulaciones((prev) => prev.map((p) => (p.id === id ? { ...p, estado: estadoAnterior } : p)));
    }
  }

  if (loading) {
    return (
      <div className="flex-1 h-full bg-surface-bright p-lg flex items-center justify-center text-on-surface-variant text-sm">
        Cargando postulaciones…
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-surface-bright p-lg overflow-x-auto relative flex flex-col gap-sm">
      {loadError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm shrink-0">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm shrink-0">
          {actionError}
        </div>
      )}

      <div className="flex gap-lg flex-1 min-h-0 pb-sm w-max">
        {ESTADOS_POSTULACION.map(({ estado, label }) => {
          const items = postulaciones.filter((p) => p.estado === estado);

          return (
            <div
              key={estado}
              onDragOver={(e) => handleDragOver(e, estado)}
              onDragLeave={() => setDragOverEstado((prev) => (prev === estado ? null : prev))}
              onDrop={(e) => handleDrop(e, estado)}
              className={cn(
                'flex flex-col w-80 h-full rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden transition-colors',
                dragOverEstado === estado && 'border-primary bg-primary-container/20'
              )}
            >
              <div className="px-md py-sm border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
                <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wide">{label}</h3>
                <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-semibold">
                  {items.length}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 overflow-y-auto p-sm space-y-sm flex flex-col items-center justify-center text-outline-variant custom-scrollbar">
                  <Inbox className="w-12 h-12 mb-1" />
                  <p className="text-xs font-medium">Sin tarjetas</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-sm space-y-sm custom-scrollbar">
                  {items.map((postulacion) => (
                    <div
                      key={postulacion.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, postulacion.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'bg-surface-container-lowest border border-outline-variant rounded-md p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-grab active:cursor-grabbing border-t-4 flex flex-col min-h-30 group',
                        scoreBorderClasses(postulacion.oferta.puntaje_scoring),
                        draggingId === postulacion.id && 'opacity-40'
                      )}
                    >
                      <div className="flex justify-between items-start mb-sm">
                        <h4 className="text-sm font-medium text-on-surface leading-tight">{postulacion.oferta.rol}</h4>
                        <button
                          type="button"
                          onClick={() => handleDelete(postulacion)}
                          aria-label="Eliminar postulación"
                          className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-on-surface-variant mb-md flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {postulacion.oferta.empresa}
                      </p>
                      <div className="flex justify-between items-end mt-auto">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <span className="text-xs font-semibold text-on-surface-variant">
                            Score: {postulacion.oferta.puntaje_scoring !== null ? Math.round(postulacion.oferta.puntaje_scoring) : '—'}
                          </span>
                        </div>
                        {postulacion.fecha_postulacion && (
                          <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{postulacion.fecha_postulacion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
