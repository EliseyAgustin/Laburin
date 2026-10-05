import { leerEnLotes } from '@/lib/lotes';
import { supabase } from '@/lib/supabase';
import type { Interaccion } from '@/types/interaccion';
import type { EstadoPostulacion, Postulacion } from '@/types/postulacion';
import type { Recordatorio } from '@/types/recordatorio';

// Fuente única del default: la usan el motor, la UI de Configuración y (por contrato) el default de la columna en la base.
export const DIAS_INACTIVIDAD_DEFECTO = 7;
export const DIAS_INACTIVIDAD_MIN = 1;
export const DIAS_INACTIVIDAD_MAX = 90;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export type ResultadoValidacionDias = { ok: true; valor: number } | { ok: false; error: string };

export function validarDiasInactividad(texto: string): ResultadoValidacionDias {
  const limpio = texto.trim();
  const error = `Ingresá un número entero de ${DIAS_INACTIVIDAD_MIN} a ${DIAS_INACTIVIDAD_MAX} días.`;
  if (!/^\d+$/.test(limpio)) return { ok: false, error };

  const valor = Number(limpio);
  if (valor < DIAS_INACTIVIDAD_MIN || valor > DIAS_INACTIVIDAD_MAX) return { ok: false, error };
  return { ok: true, valor };
}

// "Inactiva" exige estrictamente más de N días: exactamente N todavía no.
export function estaInactiva(ultimaActividad: Date | string, ahora: Date, dias: number): boolean {
  return ahora.getTime() - new Date(ultimaActividad).getTime() > dias * MS_POR_DIA;
}

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

    const ultimaActividad = Math.max(...marcasDeActividad);
    if (estaInactiva(new Date(ultimaActividad), ahora, dias)) {
      pendientes.push({
        postulacion_id: postulacion.id,
        dias_inactividad: Math.floor((ahora.getTime() - ultimaActividad) / MS_POR_DIA),
      });
    }
  }

  return pendientes;
}

export async function obtenerDiasInactividad(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('perfil_usuario')
    .select('dias_inactividad_recordatorio')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.dias_inactividad_recordatorio ?? DIAS_INACTIVIDAD_DEFECTO;
}

export async function obtenerMisDiasInactividad(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');
  return obtenerDiasInactividad(user.id);
}

// Solo aplica hacia adelante: no toca los recordatorios ya generados (ver docs del umbral).
export async function guardarDiasInactividad(dias: number): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');

  const { data, error } = await supabase
    .from('perfil_usuario')
    .upsert({ user_id: user.id, dias_inactividad_recordatorio: dias }, { onConflict: 'user_id' })
    .select('dias_inactividad_recordatorio')
    .single();

  if (error) throw error;
  return data.dias_inactividad_recordatorio as number;
}

let generacionEnCurso: Promise<void> | null = null;

async function generar(userId: string, reintentar = true): Promise<void> {
  // Por lotes: si el techo de 1000 filas truncara las interacciones, una postulación con actividad
  // pasaría por inactiva y generaría un recordatorio falso.
  const [dias, postulaciones, interacciones, recordatorios] = await Promise.all([
    obtenerDiasInactividad(userId),
    leerEnLotes<Pick<Postulacion, 'id' | 'estado' | 'created_at'>>((desde, hasta) =>
      supabase.from('postulaciones').select('id, estado, created_at').eq('user_id', userId).order('id').range(desde, hasta)
    ),
    leerEnLotes<Pick<Interaccion, 'postulacion_id' | 'fecha'>>((desde, hasta) =>
      supabase.from('interacciones').select('postulacion_id, fecha').eq('user_id', userId).order('id').range(desde, hasta)
    ),
    leerEnLotes<Pick<Recordatorio, 'postulacion_id' | 'estado' | 'fecha_resuelto'>>((desde, hasta) =>
      supabase
        .from('recordatorios')
        .select('postulacion_id, estado, fecha_resuelto')
        .eq('user_id', userId)
        .order('id')
        .range(desde, hasta)
    ),
  ]);

  const pendientes = calcularRecordatoriosPendientes({
    postulaciones,
    interacciones,
    recordatorios,
    ahora: new Date(),
    dias,
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

export function listarRecordatoriosActivos(): Promise<Recordatorio[]> {
  return leerEnLotes<Recordatorio>((desde, hasta) =>
    supabase
      .from('recordatorios')
      .select('*')
      .eq('estado', 'activo')
      .order('fecha_generado', { ascending: false })
      .order('id')
      .range(desde, hasta)
  );
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

export function listarTodosLosRecordatorios(): Promise<Recordatorio[]> {
  return leerEnLotes<Recordatorio>((desde, hasta) =>
    supabase.from('recordatorios').select('*').order('id').range(desde, hasta)
  );
}
