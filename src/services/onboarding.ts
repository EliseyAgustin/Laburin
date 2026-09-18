import { supabase } from '@/lib/supabase';
import { construirCriterio } from '@/services/criteriosScoring';
import type { PerfilUsuario, PerfilUsuarioInput } from '@/types/perfilUsuario';

const PESO_STACK = 15;
const PESO_MODALIDAD = 10;
const PESO_UBICACION = 5;

export async function obtenerPerfil(): Promise<PerfilUsuario | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('perfil_usuario')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data as PerfilUsuario | null;
}

export async function completarOnboarding(input: PerfilUsuarioInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');

  const { error: perfilError } = await supabase
    .from('perfil_usuario')
    .upsert(
      { ...input, user_id: user.id, onboarding_completado: true },
      { onConflict: 'user_id' }
    );
  if (perfilError) throw perfilError;

  const criterios = input.stack_interes.map((tech) => construirCriterio('stack', tech, PESO_STACK));

  if (input.modalidad_preferida) {
    criterios.push(construirCriterio('modalidad', input.modalidad_preferida, PESO_MODALIDAD));
  }

  if (input.ubicacion?.trim()) {
    criterios.push(construirCriterio('ubicacion', input.ubicacion.trim(), PESO_UBICACION));
  }

  if (criterios.length > 0) {
    const criteriosConUsuario = criterios.map((criterio) => ({ ...criterio, user_id: user.id }));
    const { error: criteriosError } = await supabase
      .from('criterios_scoring')
      .insert(criteriosConUsuario);
    if (criteriosError) throw criteriosError;
  }
}

export async function omitirOnboarding(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');

  const { error } = await supabase
    .from('perfil_usuario')
    .upsert({ user_id: user.id, onboarding_completado: true }, { onConflict: 'user_id' });
  if (error) throw error;
}
