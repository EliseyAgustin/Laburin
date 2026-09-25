import { supabase } from '@/lib/supabase';
import type { Interaccion } from '@/types/interaccion';
import type { EstadoPostulacion, Postulacion } from '@/types/postulacion';
import type { Recordatorio } from '@/types/recordatorio';

export const DIAS_INACTIVIDAD_RECORDATORIO = 7;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function estadoEsFinal(estado: EstadoPostulacion): boolean {
  return estado === 'oferta' || estado === 'rechazado';
}

interface CalculoRecordatoriosInput {
  postulaciones: Pick<Postulacion, 'id' | 'estado' | 'created_at'>[];
  interacciones: Pick<Interaccion, 'postulacion_id' | 'fecha'>[];
  recordatorios: Pick<Recordatorio, 'postulacion_id' | 'estado' | 'fecha_resuelto'>[];
  ahora: Date;
  dias: number;
}

// Resolver un recordatorio cuenta como "actividad": pausa la alerta N días, si no reaparecería en la próxima carga.
export function calcularRecordatoriosPendientes({
  postulaciones,
  interacciones,
  recordatorios,
  ahora,
  dias,
}: CalculoRecordatoriosInput): { postulacion_id: string; dias_inactividad: number }[] {
  const pendientes: { postulacion_id: string; dias_inactividad: number }[] = [];

  for (const postulacion of postulaciones) {
    if (estadoEsFinal(postulacion.estado)) continue;

    const propios = recordatorios.filter((r) => r.postulacion_id === postulacion.id);
    if (propios.some((r) => r.estado === 'activo')) continue;

    const marcasDeActividad = [
      postulacion.created_at,
      ...interacciones.filter((i) => i.postulacion_id === postulacion.id).map((i) => i.fecha),
      ...propios.map((r) => r.fecha_resuelto).filter((f): f is string => f !== null),
    ].map((f) => new Date(f).getTime());

    const transcurrido = ahora.getTime() - Math.max(...marcasDeActividad);
    if (transcurrido > dias * MS_POR_DIA) {
      pendientes.push({
        postulacion_id: postulacion.id,
        dias_inactividad: Math.floor(transcurrido / MS_POR_DIA),
      });
    }
  }

  return pendientes;
}

let generacionEnCurso: Promise<void> | null = null;

async function generar(userId: string, reintentar = true): Promise<void> {
  const [postulaciones, interacciones, recordatorios] = await Promise.all([
    supabase.from('postulaciones').select('id, estado, created_at').eq('user_id', userId),
    supabase.from('interacciones').select('postulacion_id, fecha').eq('user_id', userId),
    supabase.from('recordatorios').select('postulacion_id, estado, fecha_resuelto').eq('user_id', userId),
  ]);

  if (postulaciones.error) throw postulaciones.error;
  if (interacciones.error) throw interacciones.error;
  if (recordatorios.error) throw recordatorios.error;

  const pendientes = calcularRecordatoriosPendientes({
    postulaciones: postulaciones.data,
    interacciones: interacciones.data,
    recordatorios: recordatorios.data,
    ahora: new Date(),
    dias: DIAS_INACTIVIDAD_RECORDATORIO,
  });

  if (pendientes.length === 0) return;

  const { error } = await supabase.from('recordatorios').insert(pendientes);
  if (error) {
    // 23505: otra pestaña ganó la carrera (índice único parcial). Releer y recalcular ya excluye lo que insertó.
    if (error.code === '23505' && reintentar) return generar(userId, false);
    throw error;
  }
}

// StrictMode monta los efectos dos veces en desarrollo: sin esta guarda, dos corridas simultáneas duplicarían recordatorios.
export function generarRecordatorios(userId: string): Promise<void> {
  if (!generacionEnCurso) {
    generacionEnCurso = generar(userId).finally(() => {
      generacionEnCurso = null;
    });
  }
  return generacionEnCurso;
}

export async function listarRecordatoriosActivos(): Promise<Recordatorio[]> {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*')
    .eq('estado', 'activo')
    .order('fecha_generado', { ascending: false });

  if (error) throw error;
  return data as Recordatorio[];
}

export async function obtenerRecordatorioActivo(postulacionId: string): Promise<Recordatorio | null> {
  const { data, error } = await supabase
    .from('recordatorios')
    .select('*')
    .eq('postulacion_id', postulacionId)
    .eq('estado', 'activo')
    .maybeSingle();

  if (error) throw error;
  return data as Recordatorio | null;
}

export async function resolverRecordatorio(id: string): Promise<void> {
  const { error } = await supabase
    .from('recordatorios')
    .update({ estado: 'resuelto', fecha_resuelto: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function resolverRecordatoriosDePostulacion(postulacionId: string): Promise<void> {
  const { error } = await supabase
    .from('recordatorios')
    .update({ estado: 'resuelto', fecha_resuelto: new Date().toISOString() })
    .eq('postulacion_id', postulacionId)
    .eq('estado', 'activo');

  if (error) throw error;
}
