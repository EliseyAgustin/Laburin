import { RUTAS } from '@/lib/rutas';

export type Rol = 'candidato' | 'administrador';

// Sin fila en roles_usuario (o con cualquier valor desconocido) la persona es candidata: el rol administrador
// solo existe si se lo asignaron a mano en la base.
export function rolDesdeFila(fila: { rol: string } | null | undefined): Rol {
  return fila?.rol === 'administrador' ? 'administrador' : 'candidato';
}

export function rutaInicialPorRol(rol: Rol): string {
  return rol === 'administrador' ? RUTAS.candidatos : RUTAS.postulaciones;
}

function esRutaDeCandidatos(ruta: string): boolean {
  return ruta === RUTAS.candidatos || ruta.startsWith(`${RUTAS.candidatos}/`);
}

// Guarda de interfaz: el administrador solo usa Candidatos y el candidato no entra ahí. La base aplica las mismas
// reglas por su cuenta, esto solo evita mostrar pantallas que no le corresponden.
export function rutaPermitidaParaRol(rol: Rol, ruta: string): boolean {
  return rol === 'administrador' ? esRutaDeCandidatos(ruta) : !esRutaDeCandidatos(ruta);
}
