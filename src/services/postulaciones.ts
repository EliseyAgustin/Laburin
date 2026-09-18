import { supabase } from '@/lib/supabase';
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

export async function listarPostulaciones(): Promise<Postulacion[]> {
  const { data, error } = await supabase
    .from('postulaciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Postulacion[];
}

export async function listarPostulacionesConOferta(): Promise<PostulacionConOferta[]> {
  const { data, error } = await supabase
    .from('postulaciones')
    .select('*, oferta:ofertas(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as PostulacionConOferta[];
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

export async function actualizarEstadoPostulacion(
  id: string,
  estado: EstadoPostulacion
): Promise<Postulacion> {
  const { data, error } = await supabase
    .from('postulaciones')
    .update({ estado })
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
