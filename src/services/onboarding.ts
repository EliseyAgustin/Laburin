import { supabase } from '@/lib/supabase';
import type { PerfilUsuario, PerfilUsuarioInput } from '@/types/perfilUsuario';

const MODALIDAD_LABEL: Record<string, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

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

  const criterios: Record<string, unknown>[] = [];

  for (const tech of input.stack_interes) {
    criterios.push({
      user_id: user.id,
      nombre: `Stack: ${tech}`,
      tipo_coincidencia: 'contiene',
      campo_objetivo: 'stack_tecnologico',
      valor_comparacion: tech,
      peso: PESO_STACK,
    });
  }

  if (input.modalidad_preferida) {
    criterios.push({
      user_id: user.id,
      nombre: `Modalidad: ${MODALIDAD_LABEL[input.modalidad_preferida]}`,
      tipo_coincidencia: 'exacto',
      campo_objetivo: 'modalidad',
      valor_comparacion: input.modalidad_preferida,
      peso: PESO_MODALIDAD,
    });
  }

  if (input.ubicacion?.trim()) {
    criterios.push({
      user_id: user.id,
      nombre: `Ubicación: ${input.ubicacion.trim()}`,
      tipo_coincidencia: 'contiene',
      campo_objetivo: 'ubicacion',
      valor_comparacion: input.ubicacion.trim(),
      peso: PESO_UBICACION,
    });
  }

  if (criterios.length > 0) {
    const { error: criteriosError } = await supabase.from('criterios_scoring').insert(criterios);
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
