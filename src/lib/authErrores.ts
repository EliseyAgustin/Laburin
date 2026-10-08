export type ContextoAuth = 'ingreso' | 'registro' | 'recuperar' | 'nueva-password';

export type CodigoErrorAuth =
  | 'credenciales'
  | 'email_registrado'
  | 'password_debil'
  | 'password_igual'
  | 'demasiados_intentos'
  | 'enlace_vencido'
  | 'email_sin_confirmar'
  | 'conexion'
  | 'desconocido';

export interface ErrorAuthTraducido {
  codigo: CodigoErrorAuth;
  mensaje: string;
}

const MENSAJES: Record<CodigoErrorAuth, string> = {
  credenciales: 'El email y la contraseña no coinciden. Revisalos o recuperá tu contraseña.',
  email_registrado: 'Ese email ya tiene una cuenta. Podés iniciar sesión o recuperar tu contraseña.',
  password_debil: 'Esa contraseña es muy fácil de adivinar. Probá con una más larga, mezclando letras y números.',
  password_igual: 'La nueva contraseña tiene que ser distinta de la anterior.',
  demasiados_intentos: 'Hiciste muchos intentos seguidos. Esperá unos minutos y volvé a probar.',
  enlace_vencido: 'El enlace venció o ya se usó. Pedí uno nuevo para cambiar tu contraseña.',
  email_sin_confirmar: 'Todavía no confirmaste tu email. Revisá tu correo y abrí el enlace que te enviamos.',
  conexion: 'No pudimos conectarnos con el servicio. Revisá tu conexión e intentá de nuevo en un momento.',
  desconocido: 'Algo salió mal de nuestro lado. Intentá de nuevo en unos minutos.',
};

const POR_CODIGO: Record<string, CodigoErrorAuth> = {
  invalid_credentials: 'credenciales',
  user_already_exists: 'email_registrado',
  email_exists: 'email_registrado',
  weak_password: 'password_debil',
  same_password: 'password_igual',
  over_email_send_rate_limit: 'demasiados_intentos',
  over_request_rate_limit: 'demasiados_intentos',
  over_sms_send_rate_limit: 'demasiados_intentos',
  session_not_found: 'enlace_vencido',
  session_expired: 'enlace_vencido',
  otp_expired: 'enlace_vencido',
  email_not_confirmed: 'email_sin_confirmar',
};

// Respaldo para respuestas que no traen `code` (versiones viejas del servicio o errores del navegador).
const POR_MENSAJE: [RegExp, CodigoErrorAuth][] = [
  [/invalid login credentials/i, 'credenciales'],
  [/already (been )?registered|already exists/i, 'email_registrado'],
  [/password should be at least|weak password/i, 'password_debil'],
  [/should be different from the old password/i, 'password_igual'],
  [/rate limit|too many requests|security purposes/i, 'demasiados_intentos'],
  [/auth session missing|session.*(missing|not found)|link is invalid or has expired|token has expired/i, 'enlace_vencido'],
  [/email not confirmed/i, 'email_sin_confirmar'],
  [/failed to fetch|networkerror|network request failed|load failed|fetch failed/i, 'conexion'],
];

function campo(error: unknown, nombre: 'code' | 'message' | 'name'): string {
  if (typeof error !== 'object' || error === null) return '';
  const valor = (error as Record<string, unknown>)[nombre];
  return typeof valor === 'string' ? valor : '';
}

function estado(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null;
  const valor = (error as Record<string, unknown>).status;
  return typeof valor === 'number' ? valor : null;
}

// Convierte cualquier error de Supabase Auth en un mensaje en español. Nunca devuelve el texto original
// (que viene en inglés) y, en el ingreso, no revela cuál de los dos datos es el incorrecto.
// `_contexto` queda en la firma para poder diferenciar mensajes por pantalla sin cambiar a quienes la usan.
export function traducirErrorAuth(error: unknown, _contexto: ContextoAuth): ErrorAuthTraducido {
  const codigo = POR_CODIGO[campo(error, 'code')];
  if (codigo) return { codigo, mensaje: MENSAJES[codigo] };

  const nombre = campo(error, 'name');
  if (nombre === 'AuthSessionMissingError') return { codigo: 'enlace_vencido', mensaje: MENSAJES.enlace_vencido };
  if (nombre === 'AuthRetryableFetchError') return { codigo: 'conexion', mensaje: MENSAJES.conexion };

  const texto = campo(error, 'message');
  for (const [patron, porMensaje] of POR_MENSAJE) {
    if (patron.test(texto)) return { codigo: porMensaje, mensaje: MENSAJES[porMensaje] };
  }

  const status = estado(error);
  if (status !== null && (status === 0 || status >= 500)) return { codigo: 'conexion', mensaje: MENSAJES.conexion };

  return { codigo: 'desconocido', mensaje: MENSAJES.desconocido };
}
