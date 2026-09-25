import { supabase } from '@/lib/supabase';
import type { Interaccion, InteraccionInput } from '@/types/interaccion';

export async function listarInteracciones(postulacionId: string): Promise<Interaccion[]> {
  const { data, error } = await supabase
    .from('interacciones')
    .select('*')
    .eq('postulacion_id', postulacionId)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data as Interaccion[];
}

export async function crearInteraccion(input: InteraccionInput): Promise<Interaccion> {
  const { data, error } = await supabase.from('interacciones').insert(input).select().single();

  if (error) throw error;
  return data as Interaccion;
}

export async function eliminarInteraccion(id: string): Promise<void> {
  const { error } = await supabase.from('interacciones').delete().eq('id', id);
  if (error) throw error;
}

export async function listarTodasLasInteracciones(): Promise<Interaccion[]> {
  const { data, error } = await supabase.from('interacciones').select('*');

  if (error) throw error;
  return data as Interaccion[];
}
