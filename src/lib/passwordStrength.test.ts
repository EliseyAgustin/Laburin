import { describe, expect, it } from 'vitest';
import { calcularFortalezaPassword } from '@/lib/passwordStrength';

describe('calcularFortalezaPassword', () => {
  it('devuelve null para contraseña vacía (no se muestra medidor)', () => {
    expect(calcularFortalezaPassword('')).toBeNull();
  });

  it('clasifica como baja una contraseña corta y de un solo tipo de carácter', () => {
    expect(calcularFortalezaPassword('123456')).toEqual({ nivel: 'baja', puntaje: 1 });
  });

  it('clasifica como baja 8+ caracteres pero todo minúsculas, sin dígitos ni símbolos', () => {
    expect(calcularFortalezaPassword('password')).toEqual({ nivel: 'baja', puntaje: 1 });
  });

  it('clasifica como media con longitud + mayúsculas/minúsculas + dígito', () => {
    expect(calcularFortalezaPassword('Password1')).toEqual({ nivel: 'media', puntaje: 3 });
  });

  it('clasifica como fuerte con longitud + mayúsculas/minúsculas + dígito + símbolo', () => {
    expect(calcularFortalezaPassword('Password1!')).toEqual({ nivel: 'fuerte', puntaje: 4 });
  });

  it('llega al puntaje máximo con 12+ caracteres y los 4 tipos de carácter', () => {
    expect(calcularFortalezaPassword('P@ssw0rd1234')).toEqual({ nivel: 'fuerte', puntaje: 5 });
  });

  it('puntaje exactamente 2 cae en media (límite inferior de la banda)', () => {
    expect(calcularFortalezaPassword('abcdefgh1')).toEqual({ nivel: 'media', puntaje: 2 });
  });
});
