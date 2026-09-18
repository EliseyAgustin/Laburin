import { supabase } from '@/lib/supabase';
import type { CriterioScoring } from '@/types/criterioScoring';
import type { OfertaInput } from '@/types/oferta';

type OfertaParaScoring = Partial<OfertaInput> & Record<string, unknown>;

function matchContiene(valorCampo: unknown, valorComparacion: string): boolean {
  const objetivo = valorComparacion.toLowerCase();

  if (Array.isArray(valorCampo)) {
    return valorCampo.some(
      (item) => typeof item === 'string' && item.toLowerCase().includes(objetivo)
    );
  }

  if (typeof valorCampo === 'string') {
    return valorCampo.toLowerCase().includes(objetivo);
  }

  return false;
}

function matchExacto(valorCampo: unknown, valorComparacion: string): boolean {
  if (typeof valorCampo !== 'string') return false;
  return valorCampo.toLowerCase() === valorComparacion.toLowerCase();
}

function matchRangoNumerico(valorCampo: unknown, rangoMin: number | null, rangoMax: number | null): boolean {
  if (rangoMin === null || rangoMax === null) return false;

  const numero = typeof valorCampo === 'number' ? valorCampo : Number(valorCampo);
  if (Number.isNaN(numero)) return false;

  return numero >= rangoMin && numero <= rangoMax;
}

function criterioMatchea(oferta: OfertaParaScoring, criterio: CriterioScoring): boolean {
  const valorCampo = oferta[criterio.campo_objetivo];

  switch (criterio.tipo_coincidencia) {
    case 'contiene':
      return criterio.valor_comparacion !== null && matchContiene(valorCampo, criterio.valor_comparacion);
    case 'exacto':
      return criterio.valor_comparacion !== null && matchExacto(valorCampo, criterio.valor_comparacion);
    case 'rango_numerico':
      return matchRangoNumerico(valorCampo, criterio.rango_min, criterio.rango_max);
    default:
      return false;
  }
}

export function calcularScoring(oferta: OfertaParaScoring, criterios: CriterioScoring[]): number {
  return criterios
    .filter((criterio) => criterio.activo)
    .filter((criterio) => criterioMatchea(oferta, criterio))
    .reduce((total, criterio) => total + criterio.peso, 0);
}

export async function obtenerCriteriosActivos(userId: string): Promise<CriterioScoring[]> {
  const { data, error } = await supabase
    .from('criterios_scoring')
    .select('*')
    .eq('user_id', userId)
    .eq('activo', true);

  if (error) throw error;
  return data as CriterioScoring[];
}

export async function recalcularTodosLosScores(userId: string): Promise<void> {
  const criterios = await obtenerCriteriosActivos(userId);

  const { data: ofertas, error } = await supabase
    .from('ofertas')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  for (const oferta of ofertas ?? []) {
    const puntaje_scoring = calcularScoring(oferta as OfertaParaScoring, criterios);
    const { error: updateError } = await supabase
      .from('ofertas')
      .update({ puntaje_scoring })
      .eq('id', oferta.id);

    if (updateError) throw updateError;
  }
}
