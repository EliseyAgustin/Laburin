const LIMITE_DEFECTO = 50;

function normalizar(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

// Ubicaciones que existen en las ofertas cargadas, para sugerirlas en el filtro. Se juntan las que solo difieren en
// mayúsculas o espacios (queda la escritura más usada), de la más frecuente a la menos, y se limita la cantidad.
export function ubicacionesDistintas(ubicaciones: (string | null)[], limite = LIMITE_DEFECTO): string[] {
  const grupos = new Map<string, { total: number; escrituras: Map<string, number> }>();

  for (const bruta of ubicaciones) {
    if (!bruta) continue;
    const valor = normalizar(bruta);
    if (!valor) continue;

    const clave = valor.toLowerCase();
    const grupo = grupos.get(clave) ?? { total: 0, escrituras: new Map() };
    grupo.total++;
    grupo.escrituras.set(valor, (grupo.escrituras.get(valor) ?? 0) + 1);
    grupos.set(clave, grupo);
  }

  return [...grupos.values()]
    .map(({ total, escrituras }) => ({
      total,
      texto: [...escrituras.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))[0][0],
    }))
    .sort((a, b) => b.total - a.total || a.texto.localeCompare(b.texto, 'es'))
    .slice(0, limite)
    .map((u) => u.texto);
}
