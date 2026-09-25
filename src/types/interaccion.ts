export type TipoInteraccion = 'mail' | 'llamada' | 'entrevista' | 'nota';

export interface Interaccion {
  id: string;
  user_id: string;
  postulacion_id: string;
  tipo: TipoInteraccion;
  fecha: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type InteraccionInput = Pick<Interaccion, 'postulacion_id' | 'tipo' | 'fecha' | 'notas'>;
