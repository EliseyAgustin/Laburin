// Los tags de stack se comparan sin distinguir mayúsculas ni espacios de más (el scoring ya matchea así),
// pero se conserva la escritura de quien lo cargó. Sin esto "react" y "React " quedaban como dos tags distintos.
export function normalizarTag(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

export function agregarTag(tags: string[], valor: string): string[] {
  const nuevo = normalizarTag(valor);
  if (!nuevo) return tags;

  const clave = nuevo.toLowerCase();
  if (tags.some((tag) => normalizarTag(tag).toLowerCase() === clave)) return tags;
  return [...tags, nuevo];
}

export function contieneTag(tags: string[], valor: string): boolean {
  const clave = normalizarTag(valor).toLowerCase();
  if (!clave) return false;
  return tags.some((tag) => normalizarTag(tag).toLowerCase() === clave);
}

export function quitarTag(tags: string[], valor: string): string[] {
  const clave = normalizarTag(valor).toLowerCase();
  return tags.filter((tag) => normalizarTag(tag).toLowerCase() !== clave);
}
