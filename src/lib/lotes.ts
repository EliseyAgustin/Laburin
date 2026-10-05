// PostgREST (Supabase) corta cada lectura en 1000 filas. Para leer "todas" hay que pedir por rangos.
export const TAMANO_LOTE_LECTURA = 1000;

type RespuestaRango<T> = { data: T[] | null; error: unknown };

// `leer` debe usar un orden estable (p. ej. por id): si no, los rangos pueden repetir o saltear filas.
export async function leerEnLotes<T>(
  leer: (desde: number, hasta: number) => PromiseLike<RespuestaRango<T>>,
  tamano = TAMANO_LOTE_LECTURA
): Promise<T[]> {
  const filas: T[] = [];

  for (let desde = 0; ; desde += tamano) {
    const { data, error } = await leer(desde, desde + tamano - 1);
    if (error) throw error;

    const lote = data ?? [];
    filas.push(...lote);
    if (lote.length < tamano) return filas;
  }
}

export function rangoDePagina(pagina: number, tamano: number): { desde: number; hasta: number } {
  const desde = (pagina - 1) * tamano;
  return { desde, hasta: desde + tamano - 1 };
}

export function totalPaginas(total: number, tamano: number): number {
  return Math.max(1, Math.ceil(total / tamano));
}

// Tras borrar o filtrar, la página pedida puede haber dejado de existir: vuelve a la última válida.
export function paginaDentroDeRango(pagina: number, total: number, tamano: number): number {
  return Math.min(Math.max(1, pagina), totalPaginas(total, tamano));
}

// Para usar texto del usuario dentro de un patrón ILIKE sin que % o _ actúen como comodines.
export function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => '\\' + c);
}
