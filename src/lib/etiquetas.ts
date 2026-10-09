import type { Modalidad } from '@/types/oferta';
import type { Seniority } from '@/types/perfilUsuario';

export const MODALIDAD_ETIQUETA: Record<Modalidad, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

export const NIVEL_EXPERIENCIA_ETIQUETA: Record<Seniority, string> = {
  junior: 'Junior',
  semi_senior: 'Semi Senior',
  senior: 'Senior',
};

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
