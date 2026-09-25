export const FUENTE_MANUAL = 'Carga manual';

export const FUENTES_OFERTA = ['Remotive', 'Arbeitnow', FUENTE_MANUAL] as const;

export function coincideFuente(fuenteOferta: string | null, filtro: string): boolean {
  if (!filtro) return true;
  if (filtro === FUENTE_MANUAL) return !fuenteOferta || fuenteOferta === FUENTE_MANUAL;
  return fuenteOferta === filtro;
}
