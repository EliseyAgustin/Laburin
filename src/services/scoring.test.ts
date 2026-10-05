import { describe, expect, it } from 'vitest';
import { calcularScoring, scoresDesactualizados } from '@/services/scoring';
import type { CriterioScoring } from '@/types/criterioScoring';
import type { OfertaInput } from '@/types/oferta';

function ofertaBase(overrides: Partial<OfertaInput> = {}): OfertaInput {
  return {
    empresa: 'Acme',
    rol: 'QA Analyst',
    ubicacion: 'CABA, Argentina',
    modalidad: 'remoto',
    stack_tecnologico: ['React', 'SQL'],
    fuente: null,
    fecha_publicacion: null,
    ...overrides,
  };
}

function criterio(overrides: Partial<CriterioScoring> = {}): CriterioScoring {
  return {
    id: 'c1',
    user_id: 'u1',
    nombre: 'criterio de prueba',
    peso: 10,
    tipo_coincidencia: 'contiene',
    campo_objetivo: 'stack_tecnologico',
    valor_comparacion: 'React',
    rango_min: null,
    rango_max: null,
    activo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('calcularScoring', () => {
  it('devuelve 0 cuando no hay criterios', () => {
    expect(calcularScoring(ofertaBase(), [])).toBe(0);
  });

  it('suma el peso de un criterio "contiene" que matchea un tag del stack', () => {
    const criterios = [criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'stack_tecnologico', valor_comparacion: 'React', peso: 15 })];
    expect(calcularScoring(ofertaBase(), criterios)).toBe(15);
  });

  it('no suma un criterio "contiene" que no matchea ningún tag del stack', () => {
    const criterios = [criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'stack_tecnologico', valor_comparacion: 'Python', peso: 15 })];
    expect(calcularScoring(ofertaBase(), criterios)).toBe(0);
  });

  it('suma el peso de un criterio "exacto" que matchea la modalidad', () => {
    const criterios = [criterio({ tipo_coincidencia: 'exacto', campo_objetivo: 'modalidad', valor_comparacion: 'remoto', peso: 20 })];
    expect(calcularScoring(ofertaBase({ modalidad: 'remoto' }), criterios)).toBe(20);
  });

  it('no suma un criterio "exacto" cuando el valor no coincide exactamente', () => {
    const criterios = [criterio({ tipo_coincidencia: 'exacto', campo_objetivo: 'modalidad', valor_comparacion: 'hibrido', peso: 20 })];
    expect(calcularScoring(ofertaBase({ modalidad: 'remoto' }), criterios)).toBe(0);
  });

  it('suma el peso de un criterio "contiene" sobre un campo de texto (ubicación)', () => {
    const criterios = [criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'ubicacion', valor_comparacion: 'CABA', peso: 5 })];
    expect(calcularScoring(ofertaBase({ ubicacion: 'CABA, Argentina' }), criterios)).toBe(5);
  });

  it('suma el peso de un criterio "rango_numerico" cuando el valor cae dentro del rango', () => {
    const criterios = [
      criterio({
        tipo_coincidencia: 'rango_numerico',
        campo_objetivo: 'salario',
        valor_comparacion: null,
        rango_min: 1000,
        rango_max: 2000,
        peso: 25,
      }),
    ];
    expect(calcularScoring(ofertaBase({ salario: 1500 } as Partial<OfertaInput>), criterios)).toBe(25);
  });

  it('no suma un criterio "rango_numerico" cuando el valor cae fuera del rango', () => {
    const criterios = [
      criterio({
        tipo_coincidencia: 'rango_numerico',
        campo_objetivo: 'salario',
        valor_comparacion: null,
        rango_min: 1000,
        rango_max: 2000,
        peso: 25,
      }),
    ];
    expect(calcularScoring(ofertaBase({ salario: 500 } as Partial<OfertaInput>), criterios)).toBe(0);
  });

  it('ignora los criterios inactivos aunque matcheen', () => {
    const criterios = [
      criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'stack_tecnologico', valor_comparacion: 'React', peso: 15, activo: false }),
    ];
    expect(calcularScoring(ofertaBase(), criterios)).toBe(0);
  });

  it('suma los pesos de varios criterios que matchean simultáneamente', () => {
    const criterios = [
      criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'stack_tecnologico', valor_comparacion: 'React', peso: 15 }),
      criterio({ tipo_coincidencia: 'exacto', campo_objetivo: 'modalidad', valor_comparacion: 'remoto', peso: 20 }),
      criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'ubicacion', valor_comparacion: 'CABA', peso: 5 }),
    ];
    expect(calcularScoring(ofertaBase(), criterios)).toBe(40);
  });

  it('el matching de "contiene" y "exacto" ignora mayúsculas/minúsculas', () => {
    const criterios = [criterio({ tipo_coincidencia: 'contiene', campo_objetivo: 'stack_tecnologico', valor_comparacion: 'react', peso: 15 })];
    expect(calcularScoring(ofertaBase(), criterios)).toBe(15);
  });
});

describe('scoresDesactualizados', () => {
  const cs = [criterio({ valor_comparacion: 'React', peso: 15 })];
  const fila = (id: string, puntaje_scoring: number | null, stack = ['React']) => ({
    ...ofertaBase({ stack_tecnologico: stack }),
    id,
    puntaje_scoring,
  });

  it('devuelve solo las ofertas cuyo puntaje cambió', () => {
    const r = scoresDesactualizados([fila('a', 15), fila('b', 0), fila('c', 15, ['Go'])], cs);
    expect(r).toEqual([
      { id: 'b', puntaje_scoring: 15 },
      { id: 'c', puntaje_scoring: 0 },
    ]);
  });

  it('una oferta sin puntaje previo (null) se considera desactualizada', () => {
    expect(scoresDesactualizados([fila('a', null)], cs)).toEqual([{ id: 'a', puntaje_scoring: 15 }]);
  });

  it('con todo al día no devuelve nada', () => {
    expect(scoresDesactualizados([fila('a', 15)], cs)).toEqual([]);
  });

  it('funciona con más de 1000 ofertas', () => {
    const muchas = Array.from({ length: 2500 }, (_, i) => fila(`o${i}`, 0));
    expect(scoresDesactualizados(muchas, cs)).toHaveLength(2500);
  });
});
