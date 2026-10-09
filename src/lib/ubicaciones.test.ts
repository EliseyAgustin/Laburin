import { describe, expect, it } from 'vitest';
import { ubicacionesDistintas } from '@/lib/ubicaciones';

describe('ubicacionesDistintas', () => {
  it('devuelve las ubicaciones sin repetir, de la más frecuente a la menos', () => {
    expect(ubicacionesDistintas(['Argentina', 'Worldwide', 'Worldwide', 'Worldwide', 'Argentina', 'Chile'])).toEqual([
      'Worldwide',
      'Argentina',
      'Chile',
    ]);
  });
  it('junta las que solo difieren en mayúsculas o espacios, conservando la escritura más usada', () => {
    expect(ubicacionesDistintas(['Remote', 'remote', ' Remote  ', 'REMOTE'])).toEqual(['Remote']);
    expect(ubicacionesDistintas(['buenos aires', 'Buenos  Aires', 'Buenos Aires'])).toEqual(['Buenos Aires']);
  });
  it('ignora vacíos, nulos y espacios', () => {
    expect(ubicacionesDistintas([null, '', '   ', 'Chile'])).toEqual(['Chile']);
  });
  it('ante igual frecuencia ordena alfabéticamente', () => {
    expect(ubicacionesDistintas(['Uruguay', 'Chile', 'Brasil'])).toEqual(['Brasil', 'Chile', 'Uruguay']);
  });
  it('limita la cantidad', () => {
    const muchas = Array.from({ length: 80 }, (_, i) => `Ciudad ${String(i).padStart(2, '0')}`);
    expect(ubicacionesDistintas(muchas)).toHaveLength(50);
    expect(ubicacionesDistintas(muchas, 5)).toHaveLength(5);
  });
  it('sin datos devuelve una lista vacía', () => {
    expect(ubicacionesDistintas([])).toEqual([]);
  });
});
