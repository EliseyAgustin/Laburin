import { supabase } from '@/lib/supabase';
import { mensajeDeError } from '@/lib/errores';
import { calcularScoring, obtenerCriteriosActivos } from '@/services/scoring';
import type { Oferta, OfertaInput } from '@/types/oferta';

export async function listarOfertas(): Promise<Oferta[]> {
  const { data, error } = await supabase
    .from('ofertas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Oferta[];
}

export async function crearOferta(input: OfertaInput): Promise<Oferta> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay sesión activa.');

  const criterios = await obtenerCriteriosActivos(user.id);
  const puntaje_scoring = calcularScoring(input, criterios);

  const { data, error } = await supabase
    .from('ofertas')
    .insert({ ...input, user_id: user.id, puntaje_scoring })
    .select()
    .single();

  if (error) throw error;
  return data as Oferta;
}

export async function actualizarOferta(id: string, input: Partial<OfertaInput>): Promise<Oferta> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay sesión activa.');

  const { data: actual, error: actualError } = await supabase
    .from('ofertas')
    .select('*')
    .eq('id', id)
    .single();

  if (actualError) throw actualError;

  const criterios = await obtenerCriteriosActivos(user.id);
  const puntaje_scoring = calcularScoring({ ...(actual as Oferta), ...input }, criterios);

  const { data, error } = await supabase
    .from('ofertas')
    .update({ ...input, puntaje_scoring })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Oferta;
}

export async function eliminarOferta(id: string): Promise<void> {
  const { error } = await supabase.from('ofertas').delete().eq('id', id);
  if (error) throw error;
}

const TAMANO_LOTE_ELIMINACION = 50;

// Borra por lotes para no hacer una request por fila; si un lote falla, reintenta fila por fila
// para aislar la que falla. Las filas que la base no devuelve como borradas cuentan como fallidas.
export async function eliminarEnLotes(
  ids: string[],
  borrar: (lote: string[]) => Promise<string[]>,
  tamanoLote = TAMANO_LOTE_ELIMINACION
): Promise<{ eliminadas: string[]; fallidas: string[]; motivo: string | null }> {
  const eliminadas: string[] = [];
  const fallidas: string[] = [];
  let motivo: string | null = null;

  const registrar = (lote: string[], borradas: string[]) => {
    eliminadas.push(...borradas);
    fallidas.push(...lote.filter((id) => !borradas.includes(id)));
  };

  for (let i = 0; i < ids.length; i += tamanoLote) {
    const lote = ids.slice(i, i + tamanoLote);

    try {
      registrar(lote, await borrar(lote));
    } catch (err) {
      motivo ??= mensajeDeError(err, 'error desconocido');
      for (const id of lote) {
        try {
          registrar([id], await borrar([id]));
        } catch {
          fallidas.push(id);
        }
      }
    }
  }

  return { eliminadas, fallidas, motivo };
}

export function eliminarOfertas(ids: string[]) {
  return eliminarEnLotes(ids, async (lote) => {
    const { data, error } = await supabase.from('ofertas').delete().in('id', lote).select('id');
    if (error) throw error;
    return data.map((fila) => fila.id as string);
  });
}
