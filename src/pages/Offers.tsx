import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Download, Filter, MapPin, Clock, Building2, Pencil, Trash2, Plus, Inbox, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { mensajeDeError } from '@/lib/errores';
import { ApplicationDetailPanel } from '@/components/ApplicationDetailPanel';
import { ConfirmarEliminacionModal } from '@/components/ConfirmarEliminacionModal';
import { OfertaFormModal } from '@/components/OfertaFormModal';
import { FUENTES_OFERTA } from '@/lib/fuentes';
import { paginaDentroDeRango, totalPaginas } from '@/lib/lotes';
import { alternarId, alternarTodas, estadoSeleccionTodas } from '@/lib/seleccion';
import { scoreBandClasses, scoreBorderClasses } from '@/lib/utils';
import {
  actualizarOferta,
  contarPostulacionesDeOfertas,
  crearOferta,
  eliminarOferta,
  eliminarOfertas,
  FILTROS_OFERTAS_VACIOS,
  listarIdsOfertas,
  listarOfertasPagina,
  type FiltrosOfertas,
} from '@/services/ofertas';
import { crearPostulacion, ESTADO_POSTULACION_LABEL, listarPostulacionesDeOfertas } from '@/services/postulaciones';
import { importarOfertasRemotas, resumenImportacion } from '@/services/fuentesExternas';
import type { Oferta, OfertaInput } from '@/types/oferta';
import type { EstadoPostulacion, Postulacion } from '@/types/postulacion';

const MODALIDAD_LABEL: Record<string, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

const TAMANO_PAGINA = 30;

export function Offers() {
  const raizRef = useRef<HTMLDivElement>(null);
  const solicitudRef = useRef(0);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [conSeguimientoABorrar, setConSeguimientoABorrar] = useState(0);
  const [preparandoBorrado, setPreparandoBorrado] = useState(false);
  const [seleccionandoTodas, setSeleccionandoTodas] = useState(false);
  const [postulacionesPorOferta, setPostulacionesPorOferta] = useState<Record<string, Postulacion>>({});
  const [postulandoId, setPostulandoId] = useState<string | null>(null);
  const [fichaPostulacionId, setFichaPostulacionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOferta, setEditingOferta] = useState<Oferta | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [resultadoBorrado, setResultadoBorrado] = useState<{ texto: string; hayFallos: boolean } | null>(null);

  const [fuenteDraft, setFuenteDraft] = useState('');
  const [ubicacionDraft, setUbicacionDraft] = useState('');
  const [scoreDraft, setScoreDraft] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosOfertas>(FILTROS_OFERTAS_VACIOS);

  useEffect(() => {
    cargar();
  }, [filtros, pagina]);

  // La paginación y los filtros se resuelven en la base: la pantalla nunca tiene todas las ofertas en memoria.
  // `silencioso` refresca tras una mutación sin reemplazar la grilla por el cartel de carga.
  async function cargar(silencioso = false) {
    const solicitud = ++solicitudRef.current;
    if (!silencioso) setLoading(true);
    try {
      const { ofertas: delaPagina, total: totalFiltrado } = await listarOfertasPagina(filtros, pagina, TAMANO_PAGINA);
      if (solicitud !== solicitudRef.current) return;

      const paginaAjustada = paginaDentroDeRango(pagina, totalFiltrado, TAMANO_PAGINA);
      if (paginaAjustada !== pagina) {
        setPagina(paginaAjustada);
        return;
      }

      const postulaciones = await listarPostulacionesDeOfertas(delaPagina.map((o) => o.id));
      if (solicitud !== solicitudRef.current) return;

      setOfertas(delaPagina);
      setTotal(totalFiltrado);
      setPostulacionesPorOferta(Object.fromEntries(postulaciones.map((p) => [p.oferta_id, p])));
      setLoadError(null);
    } catch (err) {
      if (solicitud !== solicitudRef.current) return;
      setLoadError(mensajeDeError(err, 'No se pudieron cargar las ofertas.'));
    } finally {
      if (solicitud === solicitudRef.current) setLoading(false);
    }
  }

  function irAPagina(nueva: number) {
    setPagina(nueva);
    raizRef.current?.scrollTo({ top: 0 });
  }

  function recargarDesdeLaPrimera() {
    if (pagina !== 1) setPagina(1);
    else cargar(true);
  }

  async function handlePostularme(oferta: Oferta) {
    setPostulandoId(oferta.id);
    try {
      const postulacion = await crearPostulacion(oferta.id);
      setPostulacionesPorOferta((prev) => ({ ...prev, [oferta.id]: postulacion }));
      setLoadError(null);
    } catch (err) {
      setLoadError(mensajeDeError(err, 'No se pudo crear la postulación.'));
    } finally {
      setPostulandoId(null);
    }
  }

  async function handleImportar() {
    setImporting(true);
    setImportMessage(null);
    try {
      const resultado = await importarOfertasRemotas();
      recargarDesdeLaPrimera();

      setImportMessage(resumenImportacion(resultado));
      setLoadError(null);
    } catch (err) {
      setLoadError(mensajeDeError(err, 'No se pudieron importar ofertas remotas.'));
    } finally {
      setImporting(false);
    }
  }

  function handleEstadoFichaChange(
    postulacionId: string,
    estado: EstadoPostulacion,
    fecha_postulacion: string | null
  ) {
    setPostulacionesPorOferta((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([ofertaId, p]) => [
          ofertaId,
          p.id === postulacionId ? { ...p, estado, fecha_postulacion } : p,
        ])
      )
    );
  }

  function openCreateForm() {
    setEditingOferta(null);
    setFormOpen(true);
  }

  function openEditForm(oferta: Oferta) {
    setEditingOferta(oferta);
    setFormOpen(true);
  }

  async function handleSubmit(input: OfertaInput) {
    if (editingOferta) {
      await actualizarOferta(editingOferta.id, input);
      cargar(true);
    } else {
      await crearOferta(input);
      recargarDesdeLaPrimera();
    }
    setFormOpen(false);
    setEditingOferta(null);
  }

  async function handleDelete(oferta: Oferta) {
    if (!window.confirm(`¿Eliminar la oferta "${oferta.rol}" en ${oferta.empresa}?`)) return;
    await eliminarOferta(oferta.id);
    cargar(true);
    setSeleccionadas((prev) => {
      const siguiente = new Set(prev);
      siguiente.delete(oferta.id);
      return siguiente;
    });
  }

  function handleAplicarFiltros(e: FormEvent) {
    e.preventDefault();
    setSeleccionadas(new Set());
    setPagina(1);
    setFiltros({ fuente: fuenteDraft, ubicacion: ubicacionDraft.trim(), score: scoreDraft });
  }

  const hayFiltros =
    filtros.fuente !== FILTROS_OFERTAS_VACIOS.fuente ||
    filtros.ubicacion !== FILTROS_OFERTAS_VACIOS.ubicacion ||
    filtros.score !== FILTROS_OFERTAS_VACIOS.score;
  const paginas = totalPaginas(total, TAMANO_PAGINA);
  const hayMasQueLaPagina = total > ofertas.length;

  // La selección puede abarcar más que la página visible ("Seleccionar las N que coinciden"),
  // así que el borrado actúa siempre sobre exactamente lo que dice el contador.
  const idsSeleccionados = [...seleccionadas];
  const estadoTodas = estadoSeleccionTodas(ofertas, seleccionadas);

  async function handleSeleccionarTodasLasCoincidencias() {
    setSeleccionandoTodas(true);
    try {
      setSeleccionadas(new Set(await listarIdsOfertas(filtros)));
      setLoadError(null);
    } catch (err) {
      setLoadError(mensajeDeError(err, 'No se pudieron seleccionar las ofertas.'));
    } finally {
      setSeleccionandoTodas(false);
    }
  }

  async function handlePedirConfirmacionBorrado() {
    setResultadoBorrado(null);
    setPreparandoBorrado(true);
    try {
      setConSeguimientoABorrar(await contarPostulacionesDeOfertas(idsSeleccionados));
      setConfirmandoBorrado(true);
    } catch (err) {
      setLoadError(mensajeDeError(err, 'No se pudo preparar el borrado.'));
    } finally {
      setPreparandoBorrado(false);
    }
  }

  async function handleEliminarSeleccionadas() {
    setEliminando(true);
    try {
      const { eliminadas, fallidas, motivo } = await eliminarOfertas(idsSeleccionados);
      const borradas = new Set(eliminadas);

      cargar(true);
      setPostulacionesPorOferta((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([ofertaId]) => !borradas.has(ofertaId)))
      );
      setFichaPostulacionId((actual) =>
        actual && Object.entries(postulacionesPorOferta).some(([ofertaId, p]) => p.id === actual && borradas.has(ofertaId))
          ? null
          : actual
      );
      setSeleccionadas(new Set(fallidas));

      const partes = [`${eliminadas.length} ${eliminadas.length === 1 ? 'oferta eliminada' : 'ofertas eliminadas'}`];
      if (fallidas.length > 0) {
        partes.push(`${fallidas.length} no se pudieron eliminar${motivo ? `: ${motivo}` : ''}`);
      }
      setResultadoBorrado({ texto: partes.join(' · '), hayFallos: fallidas.length > 0 });
    } catch (err) {
      setResultadoBorrado({ texto: mensajeDeError(err, 'No se pudieron eliminar las ofertas.'), hayFallos: true });
    } finally {
      setConfirmandoBorrado(false);
      setEliminando(false);
    }
  }

  return (
    <div ref={raizRef} className="flex-1 overflow-y-auto p-margin h-full">
      <div className="max-w-7xl mx-auto">

        {/* Filters Row */}
        <form
          onSubmit={handleAplicarFiltros}
          className="flex flex-wrap items-center gap-md mb-xl p-4 bg-surface rounded-xl border border-outline-variant shadow-sm"
        >
          <div className="flex-1 min-w-37.5">
            <label htmlFor="filtro-fuente" className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Fuente</label>
            <select
              id="filtro-fuente"
              value={fuenteDraft}
              onChange={(e) => setFuenteDraft(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg p-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="">Todas las fuentes</option>
              {FUENTES_OFERTA.map((fuente) => (
                <option key={fuente} value={fuente}>
                  {fuente}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-37.5">
            <label htmlFor="filtro-ubicacion" className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Ubicación</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2 text-on-surface-variant w-4.5 h-4.5" />
              <input
                id="filtro-ubicacion"
                type="text"
                maxLength={100}
                value={ubicacionDraft}
                onChange={(e) => setUbicacionDraft(e.target.value)}
                placeholder="Ciudad o País"
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg py-2 pl-8 pr-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="w-50">
            <label htmlFor="filtro-score" className="text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider flex justify-between">
              <span>Score Mínimo</span>
              <span className="text-primary font-bold">{scoreDraft}+</span>
            </label>
            <input
              id="filtro-score"
              type="range"
              min="0"
              max="100"
              value={scoreDraft}
              onChange={(e) => setScoreDraft(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="mt-5">
            <button
              type="submit"
              className="bg-surface-container-high text-on-surface text-xs font-medium px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-2 hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <Filter className="w-4.5 h-4.5" />
              Aplicar
            </button>
          </div>
        </form>

        {importMessage && (
          <div className="mb-lg p-4 bg-primary-container text-on-primary-container rounded-lg text-sm">
            {importMessage}
          </div>
        )}

        {resultadoBorrado && (
          <div
            className={`mb-lg p-4 rounded-lg text-sm ${
              resultadoBorrado.hayFallos
                ? 'bg-error-container text-on-error-container'
                : 'bg-primary-container text-on-primary-container'
            }`}
          >
            {resultadoBorrado.texto}
          </div>
        )}

        {importing && (
          <div className="mb-lg p-4 bg-surface-container-high text-on-surface-variant rounded-lg text-sm">
            Consultando Remotive y Arbeitnow… normalmente tarda entre 5 y 15 segundos, depende de cuántas ofertas nuevas haya.
          </div>
        )}

        <div className="flex justify-end gap-3 mb-lg">
          <button
            onClick={handleImportar}
            disabled={importing}
            className="bg-surface-container-high text-on-surface text-sm font-medium px-5 py-2.5 rounded-lg border border-outline-variant shadow-sm hover:bg-surface-variant transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4.5 h-4.5" />
            {importing ? 'Importando…' : 'Importar ofertas remotas'}
          </button>
          <button
            onClick={openCreateForm}
            className="bg-primary text-on-primary text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Nueva oferta
          </button>
        </div>

        {loadError && (
          <div className="mb-lg p-4 bg-error-container text-on-error-container rounded-lg text-sm">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="text-center text-on-surface-variant text-sm py-16">Cargando ofertas…</div>
        ) : total === 0 && !hayFiltros ? (
          <div className="flex flex-col items-center justify-center text-outline-variant py-24 gap-2">
            <Inbox className="w-12 h-12" />
            <p className="text-sm font-medium text-on-surface-variant">Todavía no cargaste ninguna oferta.</p>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center text-outline-variant py-24 gap-2">
            <Inbox className="w-12 h-12" />
            <p className="text-sm font-medium text-on-surface-variant">Ninguna oferta coincide con los filtros aplicados.</p>
          </div>
        ) : (
          <>
          <div className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 px-4 py-3 bg-surface rounded-xl border border-outline-variant shadow-sm">
            <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                ref={(el) => {
                  if (el) el.indeterminate = estadoTodas === 'algunas';
                }}
                checked={estadoTodas === 'todas'}
                onChange={() => setSeleccionadas(alternarTodas(ofertas, seleccionadas))}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              {hayMasQueLaPagina ? `Seleccionar esta página (${ofertas.length})` : `Seleccionar todas (${ofertas.length})`}
            </label>

            {hayMasQueLaPagina && estadoTodas === 'todas' && seleccionadas.size < total && (
              <button
                type="button"
                onClick={handleSeleccionarTodasLasCoincidencias}
                disabled={seleccionandoTodas}
                className="min-h-11 flex items-center text-sm font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer text-left"
              >
                {seleccionandoTodas
                  ? 'Seleccionando…'
                  : `Seleccionar las ${total} ofertas que coinciden${hayFiltros ? ' con los filtros' : ''}`}
              </button>
            )}

            {idsSeleccionados.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm text-on-surface-variant">
                  {idsSeleccionados.length === 1 ? '1 seleccionada' : `${idsSeleccionados.length} seleccionadas`}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSeleccionadas(new Set())}
                    className="min-h-11 px-2 -mx-2 flex items-center text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    Deseleccionar
                  </button>
                  <button
                    type="button"
                    onClick={handlePedirConfirmacionBorrado}
                    disabled={preparandoBorrado}
                    className="min-h-11 bg-error text-on-error text-sm font-medium px-4 rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar seleccionadas ({idsSeleccionados.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ofertas.map((oferta) => (
              <div
                key={oferta.id}
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md hover:border-primary transition-all group flex flex-col h-full border-t-4 ${scoreBorderClasses(oferta.puntaje_scoring)} ${seleccionadas.has(oferta.id) ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <input
                    type="checkbox"
                    checked={seleccionadas.has(oferta.id)}
                    onChange={() => setSeleccionadas((prev) => alternarId(prev, oferta.id))}
                    aria-label={`Seleccionar la oferta ${oferta.rol} en ${oferta.empresa}`}
                    className="w-4 h-4 mt-1.5 mr-3 shrink-0 accent-primary cursor-pointer"
                  />
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-semibold leading-tight text-on-surface mb-1 group-hover:text-primary transition-colors">{oferta.rol}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant text-[13px]">
                      <Building2 className="w-4 h-4" />
                      <span>{oferta.empresa}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 border ${scoreBandClasses(oferta.puntaje_scoring)}`}>
                    {oferta.puntaje_scoring !== null ? Math.round(oferta.puntaje_scoring) : '—'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {oferta.ubicacion && (
                    <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                      <MapPin className="w-3.5 h-3.5" /> {oferta.ubicacion}
                    </span>
                  )}
                  {oferta.modalidad && (
                    <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                      <Clock className="w-3.5 h-3.5" /> {MODALIDAD_LABEL[oferta.modalidad]}
                    </span>
                  )}
                  {oferta.fuente && (
                    <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                      {oferta.fuente}
                    </span>
                  )}
                  {oferta.stack_tecnologico.map((tech) => (
                    <span key={tech} className="bg-primary-container text-on-primary-container px-2 py-1 rounded text-[11px] font-medium border border-transparent">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mb-4">
                  {postulacionesPorOferta[oferta.id] ? (
                    <button
                      onClick={() => setFichaPostulacionId(postulacionesPorOferta[oferta.id].id)}
                      title="Ver ficha de la postulación"
                      className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {ESTADO_POSTULACION_LABEL[postulacionesPorOferta[oferta.id].estado]}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePostularme(oferta)}
                      disabled={postulandoId === oferta.id}
                      className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {postulandoId === oferta.id ? 'Postulando…' : 'Postularme'}
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
                  <span className="text-on-surface-variant text-[11px] font-semibold">
                    {oferta.fecha_publicacion ?? 'Sin fecha'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(oferta)}
                      className="p-2.5 md:p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                      aria-label="Editar oferta"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(oferta)}
                      className="p-2.5 md:p-2 rounded-lg text-error hover:bg-error-container transition-colors cursor-pointer"
                      aria-label="Eliminar oferta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav
            aria-label="Paginación de ofertas"
            className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 px-4 py-3 bg-surface rounded-xl border border-outline-variant shadow-sm"
          >
            <p className="text-sm text-on-surface-variant">
              {total === 1 ? '1 oferta' : `${total} ofertas`}
              {paginas > 1 && ` · Página ${pagina} de ${paginas}`}
            </p>
            {paginas > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => irAPagina(pagina - 1)}
                  disabled={pagina <= 1 || loading}
                  className="bg-surface-container-high text-on-surface text-xs font-medium px-4 py-2 min-h-11 sm:min-h-0 rounded-lg border border-outline-variant flex items-center gap-2 hover:bg-surface-variant transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => irAPagina(pagina + 1)}
                  disabled={pagina >= paginas || loading}
                  className="bg-surface-container-high text-on-surface text-xs font-medium px-4 py-2 min-h-11 sm:min-h-0 rounded-lg border border-outline-variant flex items-center gap-2 hover:bg-surface-variant transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </nav>
          </>
        )}
      </div>

      {confirmandoBorrado && (
        <ConfirmarEliminacionModal
          cantidad={idsSeleccionados.length}
          conSeguimiento={conSeguimientoABorrar}
          eliminando={eliminando}
          onConfirmar={handleEliminarSeleccionadas}
          onCancelar={() => setConfirmandoBorrado(false)}
        />
      )}

      <ApplicationDetailPanel
        postulacionId={fichaPostulacionId}
        onClose={() => setFichaPostulacionId(null)}
        onEstadoChange={handleEstadoFichaChange}
      />

      {formOpen && (
        <OfertaFormModal
          oferta={editingOferta}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
