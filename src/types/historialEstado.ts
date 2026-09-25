import type { EstadoPostulacion } from './postulacion';

export interface HistorialEstado {
  id: string;
  user_id: string;
  postulacion_id: string;
  estado_anterior: EstadoPostulacion | null;
  estado_nuevo: EstadoPostulacion;
  fecha: string;
  es_estimado: boolean;
}
