import { describe, expect, it } from 'vitest';
import {
  validarModalidad,
  validarNombre,
  validarPasoOnboarding,
  validarRol,
  validarTecnologias,
  validarUbicacion,
} from './validacion';

describe('validarNombre', () => {
  it('pide el nombre cuando está vacío o son solo espacios', () => {
    expect(validarNombre('')).toBe('Escribí tu nombre.');
    expect(validarNombre('   ')).toBe('Escribí tu nombre.');
  });
  it('pide un nombre más largo si tiene una sola letra', () => {
    expect(validarNombre('A')).toBe('El nombre es muy corto. Escribí al menos 2 letras.');
  });
  it('acepta un nombre válido, con espacios y tildes', () => {
    expect(validarNombre('  Ana Gómez ')).toBeNull();
  });
});

describe('validarRol', () => {
  it('pide escribir un rol cuando está vacío o son solo espacios', () => {
    expect(validarRol('')).toBe('Escribí el rol que buscás, por ejemplo Frontend Developer.');
    expect(validarRol('   ')).toBe('Escribí el rol que buscás, por ejemplo Frontend Developer.');
  });
  it('pide un rol más largo si tiene una sola letra', () => {
    expect(validarRol('a')).toBe('El rol es muy corto. Escribí al menos 2 letras.');
  });
  it('acepta un rol válido', () => {
    expect(validarRol(' QA ')).toBeNull();
  });
});

describe('validarTecnologias', () => {
  it('exige al menos una tecnología', () => {
    expect(validarTecnologias([])).toBe('Elegí o escribí al menos una tecnología.');
  });
  it('acepta una lista con elementos', () => {
    expect(validarTecnologias(['SQL'])).toBeNull();
  });
});

describe('validarModalidad', () => {
  it('exige elegir una modalidad', () => {
    expect(validarModalidad(null)).toBe('Elegí una modalidad: remoto, híbrido o presencial.');
  });
  it('acepta una modalidad elegida', () => {
    expect(validarModalidad('remoto')).toBeNull();
  });
});

describe('validarUbicacion', () => {
  it('no acepta una ubicación vacía', () => {
    expect(validarUbicacion('  ')).toBe('Escribí tu ciudad o país, por ejemplo Buenos Aires, Argentina.');
  });
  it('acepta una ubicación escrita', () => {
    expect(validarUbicacion('Córdoba')).toBeNull();
  });
});

describe('validarPasoOnboarding', () => {
  const completo = { nombre: 'Ana Gómez', rol: 'QA', tecnologias: ['SQL'], modalidad: 'remoto' as const, ubicacion: 'Córdoba' };

  it('el paso 1 valida el nombre y el rol', () => {
    expect(validarPasoOnboarding(1, { ...completo, rol: '' })).toEqual({ rol: expect.any(String) });
    expect(validarPasoOnboarding(1, { ...completo, nombre: '' })).toEqual({ nombre: expect.any(String) });
    expect(validarPasoOnboarding(1, { ...completo, nombre: '', rol: '' })).toEqual({
      nombre: expect.any(String),
      rol: expect.any(String),
    });
  });
  it('el paso 2 valida las tecnologías', () => {
    expect(validarPasoOnboarding(2, { ...completo, tecnologias: [] })).toEqual({ tecnologias: expect.any(String) });
  });
  it('el paso 3 valida modalidad y ubicación a la vez', () => {
    expect(validarPasoOnboarding(3, { ...completo, modalidad: null, ubicacion: '' })).toEqual({
      modalidad: expect.any(String),
      ubicacion: expect.any(String),
    });
  });
  it('el nivel de experiencia (paso 4) es opcional', () => {
    expect(validarPasoOnboarding(4, { ...completo, rol: '', tecnologias: [] })).toEqual({});
  });
  it('el resumen (paso 5) valida todos los campos', () => {
    expect(validarPasoOnboarding(5, { nombre: '', rol: '', tecnologias: [], modalidad: null, ubicacion: '' })).toEqual({
      nombre: expect.any(String),
      rol: expect.any(String),
      tecnologias: expect.any(String),
      modalidad: expect.any(String),
      ubicacion: expect.any(String),
    });
    expect(validarPasoOnboarding(5, completo)).toEqual({});
  });
});
