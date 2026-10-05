import { describe, expect, it } from 'vitest';
import {
  calcularRecordatoriosPendientes,
  DIAS_INACTIVIDAD_DEFECTO,
  DIAS_INACTIVIDAD_MAX,
  DIAS_INACTIVIDAD_MIN,
  estadoEsFinal,
  estaInactiva,
  validarDiasInactividad,
} from '@/services/recordatorios';
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

describe('estaInactiva', () => {
  const dia = 24 * 60 * 60 * 1000;
  const desde = (ms: number) => new Date(AHORA.getTime() - ms);

  it.each([1, 7, 30, 90])('umbral %i: exactamente N días no alcanza', (n) => {
    expect(estaInactiva(desde(n * dia), AHORA, n)).toBe(false);
  });

  it.each([1, 7, 30, 90])('umbral %i: N días y 1 ms ya es inactiva', (n) => {
    expect(estaInactiva(desde(n * dia + 1), AHORA, n)).toBe(true);
  });

  it.each([1, 7, 30, 90])('umbral %i: N-1 días no es inactiva', (n) => {
    expect(estaInactiva(desde((n - 1) * dia), AHORA, n)).toBe(false);
  });

  it('acepta la fecha como string ISO', () => {
    expect(estaInactiva(haceDias(91), AHORA, 90)).toBe(true);
    expect(estaInactiva(haceDias(89), AHORA, 90)).toBe(false);
  });
});

describe('umbral variable en calcularRecordatoriosPendientes', () => {
  it('umbral 1 y 90 en los extremos', () => {
    const p = [postulacion({ created_at: haceDias(2) })];
    expect(calcular({ postulaciones: p, dias: 1 })).toHaveLength(1);
    expect(calcular({ postulaciones: p, dias: 90 })).toHaveLength(0);
    const vieja = [postulacion({ created_at: haceDias(91) })];
    expect(calcular({ postulaciones: vieja, dias: 90 })).toHaveLength(1);
  });

  // Política: el cambio de umbral solo aplica hacia adelante. Los recordatorios activos no se tocan.
  it('al bajar el umbral, una postulación que antes no calificaba pasa a generar recordatorio', () => {
    const p = [postulacion({ created_at: haceDias(5) })];
    expect(calcular({ postulaciones: p, dias: 7 })).toEqual([]);
    expect(calcular({ postulaciones: p, dias: 3 })).toEqual([{ postulacion_id: 'p1', dias_inactividad: 5 }]);
  });

  it('al subir el umbral, un recordatorio activo existente sigue activo y no se genera otro', () => {
    const activo = [{ postulacion_id: 'p1', estado: 'activo' as const, fecha_resuelto: null }];
    const p = [postulacion({ created_at: haceDias(10) })];
    expect(calcular({ postulaciones: p, recordatorios: activo, dias: 7 })).toEqual([]);
    expect(calcular({ postulaciones: p, recordatorios: activo, dias: 30 })).toEqual([]);
    // sin recordatorio previo, con el umbral alto tampoco se genera: no hay nada que "recalcular" hacia atrás
    expect(calcular({ postulaciones: p, dias: 30 })).toEqual([]);
  });
});

describe('validarDiasInactividad', () => {
  it('expone el mismo default que usa el motor', () => {
    expect(DIAS_INACTIVIDAD_DEFECTO).toBe(7);
    expect(DIAS_INACTIVIDAD_MIN).toBe(1);
    expect(DIAS_INACTIVIDAD_MAX).toBe(90);
  });

  it('acepta enteros entre 1 y 90', () => {
    expect(validarDiasInactividad('1')).toEqual({ ok: true, valor: 1 });
    expect(validarDiasInactividad(' 90 ')).toEqual({ ok: true, valor: 90 });
    expect(validarDiasInactividad('14')).toEqual({ ok: true, valor: 14 });
  });

  it.each(['', '  ', '0', '91', '-3', '2.5', 'abc', '1e1'])('rechaza %j', (texto) => {
    expect(validarDiasInactividad(texto).ok).toBe(false);
  });
});
