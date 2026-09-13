import { supabase } from '@/lib/supabase';
import type { Oferta, OfertaInput } from '@/types/oferta';

export async function listarOfertas(): Promise<Oferta[]> {
  const { data, error } = await supabase
    .from('ofertas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Oferta[];
}

export async function crearOferta(input: OfertaInput): Promise<Oferta> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay sesión activa.');

  const { data, error } = await supabase
    .from('ofertas')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Oferta;
}

export async function actualizarOferta(id: string, input: Partial<OfertaInput>): Promise<Oferta> {
  const { data, error } = await supabase
    .from('ofertas')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Oferta;
}

export async function eliminarOferta(id: string): Promise<void> {
  const { error } = await supabase.from('ofertas').delete().eq('id', id);
  if (error) throw error;
}
