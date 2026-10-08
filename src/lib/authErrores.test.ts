import { describe, expect, it } from 'vitest';
import { traducirErrorAuth } from '@/lib/authErrores';

const sinIngles = (mensaje: string) => {
  expect(mensaje).not.toMatch(/\b(invalid|already|password|should|failed|error|rate limit|network|session)\b/i);
};

describe('traducirErrorAuth', () => {
  it('credenciales incorrectas: un solo mensaje, sin decir cuál de los dos datos falla', () => {
    const r = traducirErrorAuth({ code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 }, 'ingreso');
    expect(r.codigo).toBe('credenciales');
    expect(r.mensaje).toBe('El email y la contraseña no coinciden. Revisalos o recuperá tu contraseña.');
    expect(r.mensaje.toLowerCase()).not.toMatch(/el email no|la contraseña es incorrecta|no existe/);
  });

  it('reconoce el mensaje en inglés aunque no venga el código', () => {
    expect(traducirErrorAuth({ message: 'Invalid login credentials' }, 'ingreso').codigo).toBe('credenciales');
  });

  it('email ya registrado (por código o por mensaje) en el registro', () => {
    for (const error of [
      { code: 'user_already_exists', message: 'User already registered', status: 422 },
      { code: 'email_exists', message: 'A user with this email address has already been registered', status: 422 },
      { message: 'User already registered' },
    ]) {
      const r = traducirErrorAuth(error, 'registro');
      expect(r.codigo).toBe('email_registrado');
      expect(r.mensaje).toBe('Ese email ya tiene una cuenta. Podés iniciar sesión o recuperar tu contraseña.');
    }
  });

  it('contraseña débil según el servicio', () => {
    const r = traducirErrorAuth({ code: 'weak_password', message: 'Password should be at least 6 characters' }, 'registro');
    expect(r.codigo).toBe('password_debil');
    sinIngles(r.mensaje);
  });

  it('demasiados intentos o mails', () => {
    for (const code of ['over_email_send_rate_limit', 'over_request_rate_limit']) {
      const r = traducirErrorAuth({ code, message: 'email rate limit exceeded', status: 429 }, 'recuperar');
      expect(r.codigo).toBe('demasiados_intentos');
      sinIngles(r.mensaje);
    }
  });

  it('error de red o servicio caído: mensaje genérico en español', () => {
    for (const error of [
      { name: 'AuthRetryableFetchError', message: 'Failed to fetch', status: 0 },
      { message: 'NetworkError when attempting to fetch resource.' },
      { message: 'Load failed' },
      { status: 503, message: 'Service Unavailable' },
      { status: 500, message: 'Internal Server Error' },
    ]) {
      const r = traducirErrorAuth(error, 'ingreso');
      expect(r.codigo).toBe('conexion');
      sinIngles(r.mensaje);
    }
  });

  it('nueva contraseña igual a la anterior', () => {
    const r = traducirErrorAuth(
      { code: 'same_password', message: 'New password should be different from the old password.' },
      'nueva-password'
    );
    expect(r.codigo).toBe('password_igual');
    sinIngles(r.mensaje);
  });

  it('enlace de recuperación vencido o sesión ausente', () => {
    for (const error of [
      { code: 'session_not_found', message: 'Session not found' },
      { name: 'AuthSessionMissingError', message: 'Auth session missing!' },
      { code: 'otp_expired', message: 'Email link is invalid or has expired' },
    ]) {
      const r = traducirErrorAuth(error, 'nueva-password');
      expect(r.codigo).toBe('enlace_vencido');
      expect(r.mensaje).toContain('enlace');
      sinIngles(r.mensaje);
    }
  });

  it('email no confirmado', () => {
    const r = traducirErrorAuth({ code: 'email_not_confirmed', message: 'Email not confirmed' }, 'ingreso');
    expect(r.codigo).toBe('email_sin_confirmar');
    sinIngles(r.mensaje);
  });

  it('cualquier otro error: genérico en español, nunca el texto crudo en inglés', () => {
    const r = traducirErrorAuth({ code: 'algo_raro', message: 'Something exploded in gotrue' }, 'ingreso');
    expect(r.codigo).toBe('desconocido');
    expect(r.mensaje).not.toContain('exploded');
    sinIngles(r.mensaje);
  });

  it('tolera valores que no son objetos', () => {
    expect(traducirErrorAuth(null, 'ingreso').codigo).toBe('desconocido');
    expect(traducirErrorAuth('boom', 'ingreso').codigo).toBe('desconocido');
  });
});
