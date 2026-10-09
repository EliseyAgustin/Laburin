import { describe, expect, it } from 'vitest';
import {
  ajustarPuntajeMinimo,
  clampPeso,
  construirCriterio,
  PESO_DEFECTO,
  PESO_MAXIMO,
  PESO_MINIMO,
  puntajeMaximoPosible,
  PUNTAJE_MAXIMO_SIN_CRITERIOS,
} from '@/services/criteriosScoring';

describe('construirCriterio', () => {
  it('arma un criterio "contiene" sobre stack_tecnologico para la categoría stack', () => {
    expect(construirCriterio('stack', 'React', 15)).toEqual({
      nombre: 'Stack: React',
      peso: 15,
      tipo_coincidencia: 'contiene',
      campo_objetivo: 'stack_tecnologico',
      valor_comparacion: 'React',
      rango_min: null,
      rango_max: null,
      activo: true,
    });
  });

  it('arma un criterio "exacto" sobre modalidad para la categoría modalidad, con nombre legible', () => {
    expect(construirCriterio('modalidad', 'hibrido', 10)).toEqual({
      nombre: 'Modalidad: Híbrido',
      peso: 10,
      tipo_coincidencia: 'exacto',
      campo_objetivo: 'modalidad',
      valor_comparacion: 'hibrido',
      rango_min: null,
      rango_max: null,
      activo: true,
    });
  });

  it('arma un criterio "contiene" sobre ubicacion para la categoría ubicacion', () => {
    expect(construirCriterio('ubicacion', 'Castelar', 25)).toEqual({
      nombre: 'Ubicación: Castelar',
      peso: 25,
      tipo_coincidencia: 'contiene',
      campo_objetivo: 'ubicacion',
      valor_comparacion: 'Castelar',
      rango_min: null,
      rango_max: null,
      activo: true,
    });
  });
});

describe('clampPeso', () => {
  it('deja pasar un valor dentro del rango sin tocarlo', () => {
    expect(clampPeso(15)).toBe(15);
    expect(clampPeso(0)).toBe(0);
  });

  it('recorta un valor negativo al mínimo', () => {
    expect(clampPeso(-50)).toBe(PESO_MINIMO);
  });

  it('recorta un valor gigante al máximo', () => {
    expect(clampPeso(999999999)).toBe(PESO_MAXIMO);
  });

  it('un NaN (campo vacío al guardar) cae en el mínimo, no rompe el guardado', () => {
    expect(clampPeso(Number.NaN)).toBe(PESO_MINIMO);
  });

  it('los bordes exactos del rango quedan igual', () => {
    expect(clampPeso(PESO_MINIMO)).toBe(PESO_MINIMO);
    expect(clampPeso(PESO_MAXIMO)).toBe(PESO_MAXIMO);
  });
});

describe('PESO_DEFECTO', () => {
  it('es la fuente única de los pesos iniciales: stack 15, modalidad 10, ubicación 5', () => {
    expect(PESO_DEFECTO).toEqual({ stack: 15, modalidad: 10, ubicacion: 5 });
  });
  it('queda dentro del rango permitido', () => {
    for (const peso of Object.values(PESO_DEFECTO)) {
      expect(clampPeso(peso)).toBe(peso);
    }
  });
});

describe('puntajeMaximoPosible', () => {
  const c = (peso: number, activo = true) => ({ peso, activo });

  it('suma los pesos de todos los criterios activos (stack, modalidad y ubicación)', () => {
    expect(puntajeMaximoPosible([c(15), c(15), c(10), c(5)])).toBe(45);
  });
  it('ignora los criterios desactivados', () => {
    expect(puntajeMaximoPosible([c(15), c(30, false), c(10)])).toBe(25);
  });
  it('sin criterios activos usa la escala de 100', () => {
    expect(PUNTAJE_MAXIMO_SIN_CRITERIOS).toBe(100);
    expect(puntajeMaximoPosible([])).toBe(100);
    expect(puntajeMaximoPosible([c(15, false)])).toBe(100);
    expect(puntajeMaximoPosible([c(0)])).toBe(100);
  });
  it('redondea hacia arriba los pesos con decimales, para no dejar afuera el máximo real', () => {
    expect(puntajeMaximoPosible([c(12.5), c(10.2)])).toBe(23);
  });
  it('acepta pesos que llegan como texto desde la base (numeric)', () => {
    expect(puntajeMaximoPosible([{ peso: '15.00' as unknown as number, activo: true }, c(10)])).toBe(25);
  });
});

describe('ajustarPuntajeMinimo', () => {
  it('deja el valor si entra en el tope', () => {
    expect(ajustarPuntajeMinimo(30, 45)).toBe(30);
    expect(ajustarPuntajeMinimo(45, 45)).toBe(45);
  });
  it('baja el valor al tope si lo supera', () => {
    expect(ajustarPuntajeMinimo(80, 45)).toBe(45);
  });
  it('nunca baja de 0 ni devuelve un valor inválido', () => {
    expect(ajustarPuntajeMinimo(-5, 45)).toBe(0);
    expect(ajustarPuntajeMinimo(Number.NaN, 45)).toBe(0);
  });
});
