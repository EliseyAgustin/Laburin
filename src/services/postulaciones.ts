import { leerEnLotes } from '@/lib/lotes';
import { supabase } from '@/lib/supabase';
import { fechaLocalISO } from '@/lib/utils';
import type { HistorialEstado } from '@/types/historialEstado';
import type { EstadoPostulacion, Postulacion, PostulacionConOferta } from '@/types/postulacion';

export const ESTADOS_POSTULACION: { estado: EstadoPostulacion; label: string }[] = [
  { estado: 'por_aplicar', label: 'Por aplicar' },
  { estado: 'aplicado', label: 'Aplicado' },
  { estado: 'en_proceso', label: 'En proceso' },
  { estado: 'entrevista', label: 'Entrevista' },
  { estado: 'oferta', label: 'Oferta' },
  { estado: 'rechazado', label: 'Rechazado' },
];

export const ESTADO_POSTULACION_LABEL: Record<EstadoPostulacion, string> = Object.fromEntries(
  ESTADOS_POSTULACION.map(({ estado, label }) => [estado, label])
) as Record<EstadoPostulacion, string>;

export function listarPostulaciones(): Promise<Postulacion[]> {
  return leerEnLotes<Postulacion>((desde, hasta) =>
    supabase
      .from('postulaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id')
      .range(desde, hasta)
  );
}

// Solo las postulaciones de estas ofertas (la página visible), en tandas para no armar una URL gigante.
export async function listarPostulacionesDeOfertas(ofertaIds: string[]): Promise<Postulacion[]> {
  const resultado: Postulacion[] = [];
  for (let i = 0; i < ofertaIds.length; i += 100) {
    const { data, error } = await supabase
      .from('postulaciones')
      .select('*')
      .in('oferta_id', ofertaIds.slice(i, i + 100));
    if (error) throw error;
    resultado.push(...(data as Postulacion[]));
  }
  return resultado;
}

export async function listarPostulacionesConOferta(): Promise<PostulacionConOferta[]> {
  const filas = await leerEnLotes((desde, hasta) =>
    supabase
      .from('postulaciones')
      .select('*, oferta:ofertas(*)')
      .order('created_at', { ascending: false })
      .order('id')
      .range(desde, hasta)
  );
  return filas as unknown as PostulacionConOferta[];
}

export async function obtenerPostulacionConOferta(id: string): Promise<PostulacionConOferta> {
  const { data, error } = await supabase
    .from('postulaciones')
    .select('*, oferta:ofertas(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as PostulacionConOferta;
}

export async function crearPostulacion(ofertaId: string): Promise<Postulacion> {
  const { data, error } = await supabase
    .from('postulaciones')
    .insert({ oferta_id: ofertaId })
    .select()
    .single();

  if (error) throw error;
  return data as Postulacion;
}

export function datosCambioEstado(
  estado: EstadoPostulacion,
  fechaPostulacionActual: string | null,
  hoy: string
): { estado: EstadoPostulacion; fecha_postulacion?: string } {
  if (estado !== 'por_aplicar' && !fechaPostulacionActual) {
    return { estado, fecha_postulacion: hoy };
  }
  return { estado };
}

export async function actualizarEstadoPostulacion(
  id: string,
  estado: EstadoPostulacion,
  fechaPostulacionActual: string | null
): Promise<Postulacion> {
  const { data, error } = await supabase
    .from('postulaciones')
    .update(datosCambioEstado(estado, fechaPostulacionActual, fechaLocalISO(new Date())))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Postulacion;
}

export async function eliminarPostulacion(id: string): Promise<void> {
  const { error } = await supabase.from('postulaciones').delete().eq('id', id);
  if (error) throw error;
}

export function listarHistorialEstados(): Promise<HistorialEstado[]> {
  return leerEnLotes<HistorialEstado>((desde, hasta) =>
    supabase.from('postulacion_historial_estados').select('*').order('id').range(desde, hasta)
  );
}
