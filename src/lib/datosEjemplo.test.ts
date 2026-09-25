import { describe, expect, it } from 'vitest';
import { generarDatosEjemplo } from '@/lib/datosEjemplo';

describe('generarDatosEjemplo', () => {
  it('genera un email con formato válido', () => {
    const { email } = generarDatosEjemplo(new Date('2026-09-25T12:00:00Z'));
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('genera emails distintos en momentos distintos, para no chocar con cuentas ya creadas', () => {
    const a = generarDatosEjemplo(new Date('2026-09-25T12:00:00.000Z'));
    const b = generarDatosEjemplo(new Date('2026-09-25T12:00:00.001Z'));
    expect(a.email).not.toBe(b.email);
  });

  it('genera una contraseña que cumple el mínimo de 6 caracteres del formulario', () => {
    const { password } = generarDatosEjemplo(new Date());
    expect(password.length).toBeGreaterThanOrEqual(6);
  });
});
