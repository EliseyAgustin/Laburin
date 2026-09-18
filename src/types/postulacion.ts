import type { Oferta } from './oferta';

export type EstadoPostulacion =
  | 'por_aplicar'
  | 'aplicado'
  | 'en_proceso'
  | 'entrevista'
  | 'oferta'
  | 'rechazado';

export interface Postulacion {
  id: string;
  user_id: string;
  oferta_id: string;
  estado: EstadoPostulacion;
  fecha_postulacion: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostulacionConOferta extends Postulacion {
  oferta: Oferta;
}
