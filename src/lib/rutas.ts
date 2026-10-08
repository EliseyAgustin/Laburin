// Fuente única de las rutas de la app. Las URLs viejas siguen funcionando vía redirecciones (ver App.tsx).
export const RUTAS = {
  ofertas: '/ofertas',
  postulaciones: '/mis-postulaciones',
  progreso: '/mi-progreso',
  perfil: '/mi-perfil',
} as const;

export const REDIRECCIONES_LEGACY: Record<string, string> = {
  '/tablero': RUTAS.postulaciones,
  '/analytics': RUTAS.progreso,
  '/configuracion': RUTAS.perfil,
};
