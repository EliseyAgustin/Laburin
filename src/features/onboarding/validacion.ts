import type { Modalidad } from '@/types/oferta';

export interface DatosOnboarding {
  nombre: string;
  rol: string;
  tecnologias: string[];
  modalidad: Modalidad | null;
  ubicacion: string;
}

export type ErroresOnboarding = Partial<Record<'nombre' | 'rol' | 'tecnologias' | 'modalidad' | 'ubicacion', string>>;

export function validarNombre(nombre: string): string | null {
  const limpio = nombre.trim();
  if (!limpio) return 'Escribí tu nombre.';
  if (limpio.length < 2) return 'El nombre es muy corto. Escribí al menos 2 letras.';
  return null;
}

export function validarRol(rol: string): string | null {
  const limpio = rol.trim();
  if (!limpio) return 'Escribí el rol que buscás, por ejemplo Frontend Developer.';
  if (limpio.length < 2) return 'El rol es muy corto. Escribí al menos 2 letras.';
  return null;
}

export function validarTecnologias(tecnologias: string[]): string | null {
  return tecnologias.length === 0 ? 'Elegí o escribí al menos una tecnología.' : null;
}

export function validarModalidad(modalidad: Modalidad | null): string | null {
  return modalidad === null ? 'Elegí una modalidad: remoto, híbrido o presencial.' : null;
}

export function validarUbicacion(ubicacion: string): string | null {
  return ubicacion.trim() ? null : 'Escribí tu ciudad o país, por ejemplo Buenos Aires, Argentina.';
}

function soloErrores(candidatos: ErroresOnboarding): ErroresOnboarding {
  return Object.fromEntries(Object.entries(candidatos).filter(([, mensaje]) => mensaje)) as ErroresOnboarding;
}

// Paso 1 nombre y rol, 2 tecnologías, 3 modalidad y ubicación, 4 nivel de experiencia (opcional), 5 resumen (valida todo).
export function validarPasoOnboarding(paso: number, datos: DatosOnboarding): ErroresOnboarding {
  const nombre = validarNombre(datos.nombre);
  const rol = validarRol(datos.rol);
  const tecnologias = validarTecnologias(datos.tecnologias);
  const modalidad = validarModalidad(datos.modalidad);
  const ubicacion = validarUbicacion(datos.ubicacion);

  switch (paso) {
    case 1:
      return soloErrores({ nombre, rol });
    case 2:
      return soloErrores({ tecnologias });
    case 3:
      return soloErrores({ modalidad, ubicacion });
    case 5:
      return soloErrores({ nombre, rol, tecnologias, modalidad, ubicacion });
    default:
      return {};
  }
}
