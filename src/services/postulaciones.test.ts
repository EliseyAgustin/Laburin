import { describe, expect, it } from 'vitest';
import { datosCambioEstado } from '@/services/postulaciones';

describe('datosCambioEstado', () => {
  it('setea fecha_postulacion a hoy al pasar a aplicado si todavía no tenía', () => {
    expect(datosCambioEstado('aplicado', null, '2026-09-25')).toEqual({
      estado: 'aplicado',
      fecha_postulacion: '2026-09-25',
    });
  });

  it('también la setea si salta directo a un estado posterior (ej: entrevista)', () => {
    expect(datosCambioEstado('entrevista', null, '2026-09-25')).toEqual({
      estado: 'entrevista',
      fecha_postulacion: '2026-09-25',
    });
  });

  it('no pisa una fecha_postulacion que ya existía', () => {
    expect(datosCambioEstado('en_proceso', '2026-09-10', '2026-09-25')).toEqual({ estado: 'en_proceso' });
  });

  it('no setea fecha_postulacion al volver a por_aplicar', () => {
    expect(datosCambioEstado('por_aplicar', null, '2026-09-25')).toEqual({ estado: 'por_aplicar' });
  });
});
