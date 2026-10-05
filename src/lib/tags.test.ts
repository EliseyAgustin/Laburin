import { describe, expect, it } from 'vitest';
import { agregarTag, normalizarTag } from '@/lib/tags';

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
