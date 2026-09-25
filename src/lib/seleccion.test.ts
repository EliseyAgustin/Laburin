import { describe, expect, it } from 'vitest';
import { alternarId, alternarTodas, estadoSeleccionTodas, idsSeleccionadosVisibles } from '@/lib/seleccion';

const visibles = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('alternarId', () => {
  it('agrega el id si no estaba y lo saca si estaba, sin mutar el original', () => {
    const original = new Set(['a']);
    const conB = alternarId(original, 'b');
    expect([...conB].sort()).toEqual(['a', 'b']);
    expect([...alternarId(conB, 'a')]).toEqual(['b']);
    expect([...original]).toEqual(['a']);
  });
});

describe('estadoSeleccionTodas', () => {
  it('distingue ninguna, algunas y todas entre las visibles', () => {
    expect(estadoSeleccionTodas(visibles, new Set())).toBe('ninguna');
    expect(estadoSeleccionTodas(visibles, new Set(['a']))).toBe('algunas');
    expect(estadoSeleccionTodas(visibles, new Set(['a', 'b', 'c']))).toBe('todas');
  });

  it('con la lista visible vacía es ninguna', () => {
    expect(estadoSeleccionTodas([], new Set(['a']))).toBe('ninguna');
  });

  it('ignora los ids seleccionados que ya no están visibles', () => {
    expect(estadoSeleccionTodas(visibles, new Set(['zzz']))).toBe('ninguna');
  });
});

describe('alternarTodas', () => {
  it('selecciona solo las visibles cuando no estaban todas seleccionadas', () => {
    expect([...alternarTodas(visibles, new Set(['a'])).values()].sort()).toEqual(['a', 'b', 'c']);
  });

  it('quita las visibles cuando ya estaban todas seleccionadas', () => {
    expect([...alternarTodas(visibles, new Set(['a', 'b', 'c']))]).toEqual([]);
  });

  it('no toca lo que está seleccionado fuera de lo visible', () => {
    const resultado = alternarTodas([{ id: 'a' }], new Set(['oculta']));
    expect([...resultado].sort()).toEqual(['a', 'oculta']);
  });
});

describe('idsSeleccionadosVisibles', () => {
  it('devuelve solo los seleccionados que se están mostrando, en el orden visible', () => {
    expect(idsSeleccionadosVisibles(visibles, new Set(['c', 'a', 'oculta']))).toEqual(['a', 'c']);
  });
});
