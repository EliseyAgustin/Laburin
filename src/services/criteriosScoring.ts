import { supabase } from '@/lib/supabase';
import { recalcularTodosLosScores } from '@/services/scoring';
import type { CriterioScoring, CriterioScoringInput } from '@/types/criterioScoring';
import type { Modalidad } from '@/types/oferta';

export type CategoriaCriterio = 'stack' | 'modalidad' | 'ubicacion';

// criterios_scoring.peso es numeric(5,2) en la base (tope real ~999.99); este rango es el que
// tiene sentido de producto para un "peso" de scoring, no un límite técnico.
export const PESO_MINIMO = 0;
export const PESO_MAXIMO = 999;

// Peso inicial de cada tipo de criterio: lo usa el Onboarding al crear el perfil y los formularios de
// "Mi perfil de búsqueda" al agregar uno nuevo, para que una misma tecnología valga lo mismo en ambos lados.
export const PESO_DEFECTO: Record<CategoriaCriterio, number> = {
  stack: 15,
  modalidad: 10,
  ubicacion: 5,
};

export function clampPeso(valor: number): number {
  if (Number.isNaN(valor)) return PESO_MINIMO;
  return Math.min(PESO_MAXIMO, Math.max(PESO_MINIMO, valor));
}

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

export function construirCriterio(
  categoria: CategoriaCriterio,
  valor: string,
  peso: number
): CriterioScoringInput {
  const base = { peso, rango_min: null, rango_max: null, activo: true } as const;

  switch (categoria) {
    case 'stack':
      return {
        ...base,
        nombre: `Stack: ${valor}`,
        tipo_coincidencia: 'contiene',
        campo_objetivo: 'stack_tecnologico',
        valor_comparacion: valor,
      };
    case 'modalidad':
      return {
        ...base,
        nombre: `Modalidad: ${MODALIDAD_LABEL[valor as Modalidad]}`,
        tipo_coincidencia: 'exacto',
        campo_objetivo: 'modalidad',
        valor_comparacion: valor,
      };
    case 'ubicacion':
      return {
        ...base,
        nombre: `Ubicación: ${valor}`,
        tipo_coincidencia: 'contiene',
        campo_objetivo: 'ubicacion',
        valor_comparacion: valor,
      };
  }
}

async function usuarioActual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');
  return user;
}

export async function listarCriterios(): Promise<CriterioScoring[]> {
  const user = await usuarioActual();

  const { data, error } = await supabase
    .from('criterios_scoring')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as CriterioScoring[];
}

export async function crearCriterio(input: CriterioScoringInput): Promise<CriterioScoring> {
  const user = await usuarioActual();

  const { data, error } = await supabase
    .from('criterios_scoring')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;

  await recalcularTodosLosScores(user.id);
  return data as CriterioScoring;
}

export async function actualizarCriterio(
  id: string,
  input: Partial<CriterioScoringInput>
): Promise<CriterioScoring> {
  const user = await usuarioActual();

  const { data, error } = await supabase
    .from('criterios_scoring')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await recalcularTodosLosScores(user.id);
  return data as CriterioScoring;
}

export async function eliminarCriterio(id: string): Promise<void> {
  const user = await usuarioActual();

  const { error } = await supabase.from('criterios_scoring').delete().eq('id', id);
  if (error) throw error;

  await recalcularTodosLosScores(user.id);
}
