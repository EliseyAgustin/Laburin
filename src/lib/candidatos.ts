import { MODALIDAD_ETIQUETA, NIVEL_EXPERIENCIA_ETIQUETA } from '@/lib/etiquetas';
import type { Modalidad } from '@/types/oferta';
import type { Seniority } from '@/types/perfilUsuario';

// Fila de la vista `candidatos` (solo el perfil de búsqueda; el administrador no ve nada más de cada persona).
export interface Candidato {
  user_id: string;
  nombre: string | null;
  rol_buscado: string | null;
  stack_interes: string[];
  modalidad_preferida: Modalidad | null;
  ubicacion: string | null;
  seniority: Seniority | null;
  registrado_el: string;
}

export function tieneRolBuscado(candidato: Pick<Candidato, 'rol_buscado'>): boolean {
  return Boolean(candidato.rol_buscado?.trim());
}

// Quienes omitieron el Onboarding no tienen perfil de búsqueda: no se listan para no mostrar filas vacías.
export function candidatosVisibles(candidatos: Candidato[]): Candidato[] {
  return candidatos.filter(tieneRolBuscado);
}

export function nombreParaMostrar(candidato: Pick<Candidato, 'nombre'>): string {
  return candidato.nombre?.trim() || 'Sin nombre';
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function textoBuscable(c: Candidato): string {
  return normalizar(
    [
      c.nombre,
      c.rol_buscado,
      c.ubicacion,
      ...c.stack_interes,
      c.modalidad_preferida ? MODALIDAD_ETIQUETA[c.modalidad_preferida] : null,
      c.seniority ? NIVEL_EXPERIENCIA_ETIQUETA[c.seniority] : null,
    ]
      .filter(Boolean)
      .join(' ')
  );
}

// Búsqueda simple: cada palabra escrita tiene que aparecer en algún dato del perfil (sin importar mayúsculas ni tildes).
export function filtrarCandidatos(candidatos: Candidato[], consulta: string): Candidato[] {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return candidatos;
  return candidatos.filter((c) => {
    const texto = textoBuscable(c);
    return palabras.every((p) => texto.includes(p));
  });
}
