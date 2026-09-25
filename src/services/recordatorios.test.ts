import { describe, expect, it } from 'vitest';
import { calcularRecordatoriosPendientes, estadoEsFinal } from '@/services/recordatorios';
import type { EstadoPostulacion } from '@/types/postulacion';

const AHORA = new Date('2026-09-25T12:00:00Z');

function haceDias(dias: number) {
  return new Date(AHORA.getTime() - dias * 24 * 60 * 60 * 1000).toISOString();
}

function postulacion(overrides: { id?: string; estado?: EstadoPostulacion; created_at?: string } = {}) {
  return { id: 'p1', estado: 'aplicado' as EstadoPostulacion, created_at: haceDias(30), ...overrides };
}

function calcular(args: {
  postulaciones?: ReturnType<typeof postulacion>[];
  interacciones?: { postulacion_id: string; fecha: string }[];
  recordatorios?: { postulacion_id: string; estado: 'activo' | 'resuelto'; fecha_resuelto: string | null }[];
  dias?: number;
}) {
  return calcularRecordatoriosPendientes({
    postulaciones: args.postulaciones ?? [postulacion()],
    interacciones: args.interacciones ?? [],
    recordatorios: args.recordatorios ?? [],
    ahora: AHORA,
    dias: args.dias ?? 7,
  });
}

describe('calcularRecordatoriosPendientes', () => {
  it('genera recordatorio para una postulación sin interacciones creada hace más de N días', () => {
    const resultado = calcular({ postulaciones: [postulacion({ created_at: haceDias(10) })] });
    expect(resultado).toEqual([{ postulacion_id: 'p1', dias_inactividad: 10 }]);
  });

  it('no genera recordatorio si hubo una interacción reciente', () => {
    const resultado = calcular({ interacciones: [{ postulacion_id: 'p1', fecha: haceDias(2) }] });
    expect(resultado).toEqual([]);
  });

  it('mide la inactividad desde la última interacción, no desde la creación', () => {
    const resultado = calcular({
      interacciones: [
        { postulacion_id: 'p1', fecha: haceDias(20) },
        { postulacion_id: 'p1', fecha: haceDias(8) },
      ],
    });
    expect(resultado).toEqual([{ postulacion_id: 'p1', dias_inactividad: 8 }]);
  });

  it('exige más de N días: exactamente N no alcanza', () => {
    const resultado = calcular({ postulaciones: [postulacion({ created_at: haceDias(7) })] });
    expect(resultado).toEqual([]);
  });

  it('ignora postulaciones en estado final (oferta, rechazado)', () => {
    const resultado = calcular({
      postulaciones: [
        postulacion({ id: 'p1', estado: 'oferta' }),
        postulacion({ id: 'p2', estado: 'rechazado' }),
      ],
    });
    expect(resultado).toEqual([]);
  });

  it('incluye postulaciones en por_aplicar', () => {
    const resultado = calcular({ postulaciones: [postulacion({ estado: 'por_aplicar' })] });
    expect(resultado).toHaveLength(1);
  });

  it('no duplica si ya hay un recordatorio activo para esa postulación', () => {
    const resultado = calcular({
      recordatorios: [{ postulacion_id: 'p1', estado: 'activo', fecha_resuelto: null }],
    });
    expect(resultado).toEqual([]);
  });

  it('un recordatorio resuelto hace poco pausa la alerta hasta que pasen N días desde que se resolvió', () => {
    const resultado = calcular({
      recordatorios: [{ postulacion_id: 'p1', estado: 'resuelto', fecha_resuelto: haceDias(2) }],
    });
    expect(resultado).toEqual([]);
  });

  it('vuelve a generar recordatorio si el resuelto es viejo y sigue sin novedades', () => {
    const resultado = calcular({
      recordatorios: [{ postulacion_id: 'p1', estado: 'resuelto', fecha_resuelto: haceDias(8) }],
    });
    expect(resultado).toEqual([{ postulacion_id: 'p1', dias_inactividad: 8 }]);
  });

  it('respeta un N distinto', () => {
    const resultado = calcular({ postulaciones: [postulacion({ created_at: haceDias(4) })], dias: 3 });
    expect(resultado).toEqual([{ postulacion_id: 'p1', dias_inactividad: 4 }]);
  });
});

describe('estadoEsFinal', () => {
  it('considera finales solo oferta y rechazado', () => {
    expect(estadoEsFinal('oferta')).toBe(true);
    expect(estadoEsFinal('rechazado')).toBe(true);
    expect(estadoEsFinal('por_aplicar')).toBe(false);
    expect(estadoEsFinal('aplicado')).toBe(false);
    expect(estadoEsFinal('en_proceso')).toBe(false);
    expect(estadoEsFinal('entrevista')).toBe(false);
  });
});
