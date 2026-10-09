import { supabase } from '@/lib/supabase';
import { rolDesdeFila, type Rol } from '@/lib/rol';

// Cada persona solo puede leer su propia fila de roles_usuario (la base no deja escribirla desde la app).
export async function obtenerMiRol(): Promise<Rol> {
  const { data, error } = await supabase.from('roles_usuario').select('rol').maybeSingle();
  if (error) throw error;
  return rolDesdeFila(data);
}
