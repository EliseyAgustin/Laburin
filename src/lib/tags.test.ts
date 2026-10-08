import { describe, expect, it } from 'vitest';
import { agregarTag, contieneTag, normalizarTag, quitarTag } from '@/lib/tags';

describe('normalizarTag', () => {
  it('recorta los extremos y colapsa espacios internos', () => {
    expect(normalizarTag('  Node.js  ')).toBe('Node.js');
    expect(normalizarTag('Spring    Boot')).toBe('Spring Boot');
    expect(normalizarTag('\tReact\n')).toBe('React');
  });
  it('conserva las mayúsculas que escribió la persona', () => {
    expect(normalizarTag('TypeScript')).toBe('TypeScript');
  });
});

describe('agregarTag', () => {
  it('agrega un tag nuevo normalizado al final', () => {
    expect(agregarTag(['React'], '  Vue ')).toEqual(['React', 'Vue']);
  });
  it('ignora un duplicado que solo difiere en mayúsculas o espacios', () => {
    expect(agregarTag(['React'], 'react')).toEqual(['React']);
    expect(agregarTag(['Spring Boot'], '  spring   BOOT ')).toEqual(['Spring Boot']);
  });
  it('ignora valores vacíos o solo espacios', () => {
    expect(agregarTag(['React'], '   ')).toEqual(['React']);
    expect(agregarTag([], '')).toEqual([]);
  });
  it('no muta la lista original', () => {
    const original = ['React'];
    agregarTag(original, 'Vue');
    expect(original).toEqual(['React']);
  });
});

describe('contieneTag', () => {
  it('compara sin distinguir mayúsculas ni espacios de más', () => {
    expect(contieneTag(['SQL'], 'sql')).toBe(true);
    expect(contieneTag(['Spring Boot'], '  spring   boot ')).toBe(true);
  });
  it('devuelve false si no está o si el valor está vacío', () => {
    expect(contieneTag(['SQL'], 'NoSQL')).toBe(false);
    expect(contieneTag(['SQL'], '   ')).toBe(false);
  });
});

describe('quitarTag', () => {
  it('quita el tag sin distinguir mayúsculas', () => {
    expect(quitarTag(['React', 'SQL'], 'sql')).toEqual(['React']);
  });
  it('no muta la lista original y deja igual lo que no está', () => {
    const original = ['React'];
    expect(quitarTag(original, 'Vue')).toEqual(['React']);
    expect(original).toEqual(['React']);
  });
});
