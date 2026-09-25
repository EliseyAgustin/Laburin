export type EstadoRecordatorio = 'activo' | 'resuelto';

export interface Recordatorio {
  id: string;
  user_id: string;
  postulacion_id: string;
  dias_inactividad: number;
  estado: EstadoRecordatorio;
  fecha_generado: string;
  fecha_resuelto: string | null;
  created_at: string;
  updated_at: string;
}
