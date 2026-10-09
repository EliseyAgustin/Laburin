import { supabase } from '@/lib/supabase';
import type { Mensaje } from '@/lib/mensajes';

// Aviso interno para que el contador de no leídos del menú se actualice sin esperar a la próxima navegación.
export const EVENTO_MENSAJES_CAMBIARON = 'laburin:mensajes-cambiaron';

function avisarCambio() {
  window.dispatchEvent(new Event(EVENTO_MENSAJES_CAMBIARON));
}

export async function listarMisMensajes(): Promise<Mensaje[]> {
  const { data, error } = await supabase.from('mensajes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Mensaje[];
}

export async function contarMisMensajesNoLeidos(): Promise<number> {
  const { count, error } = await supabase
    .from('mensajes')
    .select('id', { count: 'exact', head: true })
    .eq('leido', false);
  if (error) throw error;
  return count ?? 0;
}

export async function marcarMensajeLeido(id: string): Promise<void> {
  const { error } = await supabase.from('mensajes').update({ leido: true }).eq('id', id);
  if (error) throw error;
  avisarCambio();
}

export async function marcarTodosLosMensajesLeidos(): Promise<void> {
  const { error } = await supabase.from('mensajes').update({ leido: true }).eq('leido', false);
  if (error) throw error;
  avisarCambio();
}

export async function borrarMensaje(id: string): Promise<void> {
  const { error } = await supabase.from('mensajes').delete().eq('id', id);
  if (error) throw error;
  avisarCambio();
}

// Solo el administrador puede enviar (la base lo exige); el remitente siempre es quien tiene la sesión.
export async function enviarMensaje(destinatarioId: string, texto: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');

  const { error } = await supabase
    .from('mensajes')
    .insert({ remitente_id: user.id, destinatario_id: destinatarioId, tipo: 'admin', texto: texto.trim() });
  if (error) throw error;
}

export async function listarMensajesEnviadosA(destinatarioId: string): Promise<Mensaje[]> {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('destinatario_id', destinatarioId)
    .eq('tipo', 'admin')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Mensaje[];
}
