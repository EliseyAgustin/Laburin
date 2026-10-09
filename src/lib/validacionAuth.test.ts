import { describe, expect, it } from 'vitest';
import {
  PASSWORD_MIN,
  validarConfirmacion,
  validarEmail,
  validarPasswordIngreso,
  validarPasswordNueva,
} from '@/lib/validacionAuth';

describe('validarEmail', () => {
  it('pide el email cuando está vacío', () => {
    expect(validarEmail('')).toBe('Escribí tu email.');
    expect(validarEmail('   ')).toBe('Escribí tu email.');
  });
  it('explica cómo escribirlo cuando no tiene arroba, sin la palabra "incluye"', () => {
    const mensaje = validarEmail('nombrecorreo.com');
    expect(mensaje).toBe('Escribí un email válido, por ejemplo nombre@correo.com');
    expect(mensaje?.toLowerCase()).not.toContain('incluye');
  });
  it('rechaza formatos incompletos', () => {
    for (const email of ['a@', '@b.com', 'a@b', 'a b@c.com', 'a@b.', 'a@@b.com']) {
      expect(validarEmail(email), email).toBe('Escribí un email válido, por ejemplo nombre@correo.com');
    }
  });
  it('acepta emails válidos, incluso con espacios alrededor', () => {
    expect(validarEmail('nombre@correo.com')).toBeNull();
    expect(validarEmail('  Nombre.Apellido+tag@sub.correo.com.ar ')).toBeNull();
  });
});

describe('validarPasswordIngreso', () => {
  it('solo exige que no esté vacía (las cuentas viejas pueden tener cualquier largo)', () => {
    expect(validarPasswordIngreso('')).toBe('Escribí tu contraseña.');
    expect(validarPasswordIngreso('abc')).toBeNull();
  });
});

describe('validarPasswordNueva', () => {
  it('pide elegir una contraseña cuando está vacía', () => {
    expect(validarPasswordNueva('')).toBe('Elegí una contraseña.');
  });
  it('exige el largo mínimo', () => {
    expect(PASSWORD_MIN).toBe(8);
    expect(validarPasswordNueva('1234567')).toBe('La contraseña tiene que tener al menos 8 caracteres.');
    expect(validarPasswordNueva('12345678')).toBeNull();
  });
});

describe('validarConfirmacion', () => {
  it('pide repetir la contraseña', () => {
    expect(validarConfirmacion('abcdef', '')).toBe('Repetí la contraseña para confirmarla.');
  });
  it('avisa si no coinciden', () => {
    expect(validarConfirmacion('abcdef', 'abcdeg')).toBe('Las contraseñas no coinciden.');
  });
  it('acepta dos iguales', () => {
    expect(validarConfirmacion('abcdef', 'abcdef')).toBeNull();
  });
});
