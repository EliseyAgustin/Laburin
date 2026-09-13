import type { Modalidad } from './oferta';

export type Seniority = 'junior' | 'semi_senior' | 'senior';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  rol_buscado: string | null;
  stack_interes: string[];
  modalidad_preferida: Modalidad | null;
  ubicacion: string | null;
  seniority: Seniority | null;
  onboarding_completado: boolean;
  created_at: string;
  updated_at: string;
}

export type PerfilUsuarioInput = Omit<
  PerfilUsuario,
  'id' | 'user_id' | 'onboarding_completado' | 'created_at' | 'updated_at'
>;
