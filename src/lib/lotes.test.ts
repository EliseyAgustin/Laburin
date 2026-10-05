import { describe, expect, it } from 'vitest';
import { escaparLike, leerEnLotes, paginaDentroDeRango, rangoDePagina, totalPaginas } from '@/lib/lotes';

// Simula una tabla de `total` filas que, como PostgREST, devuelve como máximo el rango pedido.
function tablaFalsa(total: number) {
  const llamadas: [number, number][] = [];
  const leer = async (desde: number, hasta: number) => {
    llamadas.push([desde, hasta]);
    const filas = Array.from({ length: Math.max(0, Math.min(hasta + 1, total) - desde) }, (_, i) => desde + i);
    return { data: filas, error: null };
  };
  return { leer, llamadas };
}

describe('leerEnLotes', () => {
  it('con 0 filas hace una sola lectura y devuelve vacío', async () => {
    const { leer, llamadas } = tablaFalsa(0);
    expect(await leerEnLotes(leer, 1000)).toEqual([]);
    expect(llamadas).toEqual([[0, 999]]);
  });

  it('con menos filas que el lote no pide una segunda tanda', async () => {
    const { leer, llamadas } = tablaFalsa(999);
    expect(await leerEnLotes(leer, 1000)).toHaveLength(999);
    expect(llamadas).toHaveLength(1);
  });

  it('con exactamente un lote lleno pide otra tanda para confirmar que no hay más', async () => {
    const { leer, llamadas } = tablaFalsa(1000);
    expect(await leerEnLotes(leer, 1000)).toHaveLength(1000);
    expect(llamadas).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it('trae todas las filas pasada la fila 1000, sin repetir ni perder', async () => {
    const { leer } = tablaFalsa(2501);
    const filas = await leerEnLotes(leer, 1000);
    expect(filas).toHaveLength(2501);
    expect(filas).toEqual(Array.from({ length: 2501 }, (_, i) => i));
  });

  it('propaga el error de una lectura', async () => {
    const boom = new Error('falló');
    await expect(leerEnLotes(async () => ({ data: null, error: boom }), 10)).rejects.toBe(boom);
  });
});

describe('rangoDePagina', () => {
  it('la página 1 arranca en 0', () => {
    expect(rangoDePagina(1, 30)).toEqual({ desde: 0, hasta: 29 });
  });
  it('páginas siguientes avanzan de a un tamaño', () => {
    expect(rangoDePagina(2, 30)).toEqual({ desde: 30, hasta: 59 });
    expect(rangoDePagina(35, 30)).toEqual({ desde: 1020, hasta: 1049 });
  });
});

describe('totalPaginas', () => {
  it('siempre hay al menos una página', () => {
    expect(totalPaginas(0, 30)).toBe(1);
  });
  it('redondea hacia arriba', () => {
    expect(totalPaginas(30, 30)).toBe(1);
    expect(totalPaginas(31, 30)).toBe(2);
    expect(totalPaginas(1001, 30)).toBe(34);
  });
});

describe('paginaDentroDeRango', () => {
  it('deja pasar páginas válidas', () => {
    expect(paginaDentroDeRango(2, 61, 30)).toBe(2);
  });
  it('si la página quedó vacía tras borrar, vuelve a la última', () => {
    expect(paginaDentroDeRango(3, 60, 30)).toBe(2);
    expect(paginaDentroDeRango(5, 0, 30)).toBe(1);
  });
  it('nunca baja de 1', () => {
    expect(paginaDentroDeRango(0, 100, 30)).toBe(1);
  });
});

describe('escaparLike', () => {
  it('escapa los comodines de LIKE para que se busquen literalmente', () => {
    expect(escaparLike('100%')).toBe('100\\%');
    expect(escaparLike('a_b')).toBe('a\\_b');
    expect(escaparLike('c:\\x')).toBe('c:\\\\x');
  });
  it('no toca texto común', () => {
    expect(escaparLike('Buenos Aires')).toBe('Buenos Aires');
  });
});
