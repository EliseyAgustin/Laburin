export type TipoCoincidencia = 'exacto' | 'contiene' | 'rango_numerico';

export interface CriterioScoring {
  id: string;
  user_id: string;
  nombre: string;
  peso: number;
  tipo_coincidencia: TipoCoincidencia;
  campo_objetivo: string;
  valor_comparacion: string | null;
  rango_min: number | null;
  rango_max: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type CriterioScoringInput = Omit<
  CriterioScoring,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
