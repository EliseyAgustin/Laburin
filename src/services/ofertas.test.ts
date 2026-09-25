import { describe, expect, it } from 'vitest';
import { eliminarEnLotes } from '@/services/ofertas';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `id${i}`);

describe('eliminarEnLotes', () => {
  it('no llama a borrar cuando no hay ids', async () => {
    let llamadas = 0;
    const r = await eliminarEnLotes([], async () => {
      llamadas++;
      return [];
    });
    expect(llamadas).toBe(0);
    expect(r).toEqual({ eliminadas: [], fallidas: [], motivo: null });
  });

  it('parte los ids en lotes del tamaño indicado', async () => {
    const tamanos: number[] = [];
    const r = await eliminarEnLotes(
      ids(120),
      async (lote) => {
        tamanos.push(lote.length);
        return lote;
      },
      50
    );
    expect(tamanos).toEqual([50, 50, 20]);
    expect(r.eliminadas).toHaveLength(120);
    expect(r.fallidas).toEqual([]);
  });

  it('cuenta como fallidas las filas que la base no devolvió como borradas, sin error', async () => {
    const r = await eliminarEnLotes(['a', 'b', 'c'], async () => ['a', 'c']);
    expect(r.eliminadas).toEqual(['a', 'c']);
    expect(r.fallidas).toEqual(['b']);
  });

  it('si un lote falla, reintenta fila por fila y aísla solo la que falla', async () => {
    const borrar = async (lote: string[]) => {
      if (lote.includes('mala')) throw { code: '23503', message: 'viola una restricción' };
      return lote;
    };
    const r = await eliminarEnLotes(['a', 'mala', 'b'], borrar, 10);
    expect(r.eliminadas).toEqual(['a', 'b']);
    expect(r.fallidas).toEqual(['mala']);
    expect(r.motivo).toBe('viola una restricción (23503)');
  });

  it('un lote que falla no impide procesar los siguientes', async () => {
    const borrar = async (lote: string[]) => {
      if (lote.includes('mala')) throw new Error('boom');
      return lote;
    };
    const r = await eliminarEnLotes(['mala', 'x', 'y', 'z'], borrar, 2);
    expect(r.eliminadas.sort()).toEqual(['x', 'y', 'z']);
    expect(r.fallidas).toEqual(['mala']);
  });

  it('si falla todo, todas quedan como fallidas y el proceso no se cae', async () => {
    const r = await eliminarEnLotes(['a', 'b', 'c'], async () => {
      throw new Error('sin conexión');
    });
    expect(r.eliminadas).toEqual([]);
    expect(r.fallidas).toEqual(['a', 'b', 'c']);
    expect(r.motivo).toBe('sin conexión');
  });
});
