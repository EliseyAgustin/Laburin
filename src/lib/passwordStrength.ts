export type NivelFortalezaPassword = 'baja' | 'media' | 'fuerte';

export interface FortalezaPassword {
  nivel: NivelFortalezaPassword;
  puntaje: number;
}

// Puntaje 0-5: longitud (2 puntos) + mezcla de mayúsculas/minúsculas + dígito + símbolo (1 punto c/u).
// Solo indicativo — no reemplaza el minLength ya validado por el formulario.
export function calcularFortalezaPassword(password: string): FortalezaPassword | null {
  if (password.length === 0) return null;

  let puntaje = 0;
  if (password.length >= 8) puntaje++;
  if (password.length >= 12) puntaje++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) puntaje++;
  if (/\d/.test(password)) puntaje++;
  if (/[^a-zA-Z0-9]/.test(password)) puntaje++;

  const nivel: NivelFortalezaPassword = puntaje <= 1 ? 'baja' : puntaje <= 3 ? 'media' : 'fuerte';
  return { nivel, puntaje };
}
