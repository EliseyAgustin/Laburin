// postgrest-js devuelve los errores como objetos planos ({ message, code, ... }), no como instancias de Error.
export function mensajeDeError(err: unknown, generico: string): string {
  if (err instanceof Error) return err.message || generico;
  if (typeof err === 'string') return err || generico;

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const { message, code } = err as { message?: unknown; code?: unknown };
    if (typeof message === 'string' && message) {
      return typeof code === 'string' && code ? `${message} (${code})` : message;
    }
  }

  return generico;
}

export async function conContexto<T>(contexto: string, promesa: Promise<T>): Promise<T> {
  try {
    return await promesa;
  } catch (err) {
    throw new Error(`${contexto}: ${mensajeDeError(err, 'error desconocido')}`);
  }
}
