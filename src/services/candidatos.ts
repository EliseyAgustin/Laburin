import { supabase } from '@/lib/supabase';
import { candidatosVisibles, tieneRolBuscado, type Candidato } from '@/lib/candidatos';

// Solo el administrador recibe filas de la vista `candidatos`; para cualquier otra persona vuelve vacía.
export async function listarCandidatos(): Promise<Candidato[]> {
  const { data, error } = await supabase.from('candidatos').select('*').order('registrado_el', { ascending: false });
  if (error) throw error;
  return candidatosVisibles(data as Candidato[]);
}

export async function obtenerCandidato(userId: string): Promise<Candidato | null> {
  const { data, error } = await supabase.from('candidatos').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const candidato = data as Candidato | null;
  return candidato && tieneRolBuscado(candidato) ? candidato : null;
}
