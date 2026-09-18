import { describe, expect, it } from 'vitest';
import { construirCriterio } from '@/services/criteriosScoring';

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
