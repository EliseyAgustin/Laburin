import { describe, expect, it } from 'vitest';
import { conContexto, mensajeDeError } from '@/lib/errores';

describe('mensajeDeError', () => {
  it('devuelve el mensaje de un Error', () => {
    expect(mensajeDeError(new Error('falló algo'), 'genérico')).toBe('falló algo');
  });

  it('devuelve el mensaje de un objeto plano como los de Supabase, con su código', () => {
    const errorSupabase = {
      code: 'PGRST205',
      message: "Could not find the table 'public.x' in the schema cache",
      details: null,
      hint: null,
    };
    expect(mensajeDeError(errorSupabase, 'genérico')).toBe(
      "Could not find the table 'public.x' in the schema cache (PGRST205)"
    );
  });

  it('devuelve solo el mensaje si el objeto no trae código', () => {
    expect(mensajeDeError({ message: 'sin código' }, 'genérico')).toBe('sin código');
  });

  it('acepta un string', () => {
    expect(mensajeDeError('texto suelto', 'genérico')).toBe('texto suelto');
  });

  it('usa el genérico cuando no hay nada útil', () => {
    expect(mensajeDeError(null, 'genérico')).toBe('genérico');
    expect(mensajeDeError(undefined, 'genérico')).toBe('genérico');
    expect(mensajeDeError({}, 'genérico')).toBe('genérico');
    expect(mensajeDeError({ message: '' }, 'genérico')).toBe('genérico');
    expect(mensajeDeError(42, 'genérico')).toBe('genérico');
  });
});

describe('conContexto', () => {
  it('deja pasar el valor cuando la promesa se resuelve', async () => {
    await expect(conContexto('historial', Promise.resolve(42))).resolves.toBe(42);
  });

  it('antepone el contexto al mensaje cuando la promesa falla, también con errores planos de Supabase', async () => {
    await expect(
      conContexto('historial de estados', Promise.reject({ code: 'PGRST205', message: 'tabla inexistente' }))
    ).rejects.toThrow('historial de estados: tabla inexistente (PGRST205)');
  });
});
