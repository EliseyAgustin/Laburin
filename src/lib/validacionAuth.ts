// Mínimo que acepta el servicio de autenticación (Supabase). El medidor de fortaleza orienta, no bloquea.
export const PASSWORD_MIN = 6;

const MENSAJE_EMAIL_INVALIDO = 'Escribí un email válido, por ejemplo nombre@correo.com';

export function validarEmail(email: string): string | null {
  const limpio = email.trim();
  if (!limpio) return 'Escribí tu email.';
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(limpio)) return MENSAJE_EMAIL_INVALIDO;
  return null;
}

// Al ingresar solo se exige que no esté vacía: una cuenta anterior puede tener cualquier largo.
export function validarPasswordIngreso(password: string): string | null {
  return password ? null : 'Escribí tu contraseña.';
}

export function validarPasswordNueva(password: string): string | null {
  if (!password) return 'Elegí una contraseña.';
  if (password.length < PASSWORD_MIN) return `La contraseña tiene que tener al menos ${PASSWORD_MIN} caracteres.`;
  return null;
}

export function validarConfirmacion(password: string, confirmacion: string): string | null {
  if (!confirmacion) return 'Repetí la contraseña para confirmarla.';
  if (password !== confirmacion) return 'Las contraseñas no coinciden.';
  return null;
}
