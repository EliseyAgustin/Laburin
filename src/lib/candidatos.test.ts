import { describe, expect, it } from 'vitest';
import { candidatosVisibles, filtrarCandidatos, nombreParaMostrar, tieneRolBuscado, type Candidato } from '@/lib/candidatos';

const base: Candidato = {
  user_id: 'u1',
  nombre: 'Ana Gómez',
  rol_buscado: 'Frontend Developer',
  stack_interes: ['React', 'TypeScript'],
  modalidad_preferida: 'remoto',
  ubicacion: 'Córdoba, Argentina',
  seniority: 'junior',
  registrado_el: '2026-10-01T10:00:00Z',
};
const c = (cambios: Partial<Candidato>): Candidato => ({ ...base, ...cambios });

describe('tieneRolBuscado', () => {
  it('es verdadero con un rol escrito', () => {
    expect(tieneRolBuscado(c({ rol_buscado: 'QA' }))).toBe(true);
  });
  it('es falso con rol nulo, vacío o de solo espacios', () => {
    for (const rol_buscado of [null, '', '   ']) expect(tieneRolBuscado(c({ rol_buscado })), String(rol_buscado)).toBe(false);
  });
});

describe('candidatosVisibles', () => {
  it('oculta a quienes omitieron el Onboarding (sin rol buscado)', () => {
    const lista = [c({ user_id: 'a' }), c({ user_id: 'b', rol_buscado: null }), c({ user_id: 'c', rol_buscado: '  ' })];
    expect(candidatosVisibles(lista).map((x) => x.user_id)).toEqual(['a']);
  });
  it('no muta la lista original', () => {
    const lista = [c({ rol_buscado: null })];
    candidatosVisibles(lista);
    expect(lista).toHaveLength(1);
  });
});

describe('nombreParaMostrar', () => {
  it('usa el nombre y, si falta, "Sin nombre"', () => {
    expect(nombreParaMostrar(c({ nombre: ' Ana Gómez ' }))).toBe('Ana Gómez');
    expect(nombreParaMostrar(c({ nombre: null }))).toBe('Sin nombre');
    expect(nombreParaMostrar(c({ nombre: '   ' }))).toBe('Sin nombre');
  });
});

describe('filtrarCandidatos', () => {
  const lista = [
    c({ user_id: 'ana' }),
    c({
      user_id: 'luis',
      nombre: 'Luis Pérez',
      rol_buscado: 'Data Analyst',
      stack_interes: ['Python', 'SQL'],
      ubicacion: 'Rosario',
      modalidad_preferida: 'hibrido',
    }),
    c({
      user_id: 'sol',
      nombre: 'Sol Ñandú',
      rol_buscado: 'QA Automation',
      stack_interes: ['Selenium'],
      ubicacion: 'Mendoza',
      modalidad_preferida: 'presencial',
    }),
  ];
  const ids = (consulta: string) => filtrarCandidatos(lista, consulta).map((x) => x.user_id);

  it('sin texto devuelve todos', () => {
    expect(ids('')).toEqual(['ana', 'luis', 'sol']);
    expect(ids('   ')).toEqual(['ana', 'luis', 'sol']);
  });
  it('busca por nombre, rol, tecnología y ubicación', () => {
    expect(ids('luis')).toEqual(['luis']);
    expect(ids('analyst')).toEqual(['luis']);
    expect(ids('selenium')).toEqual(['sol']);
    expect(ids('rosario')).toEqual(['luis']);
  });
  it('no distingue mayúsculas ni tildes', () => {
    expect(ids('GOMEZ')).toEqual(['ana']);
    expect(ids('perez')).toEqual(['luis']);
    expect(ids('nandu')).toEqual(['sol']);
    expect(ids('cordoba')).toEqual(['ana']);
  });
  it('busca por modalidad con el nombre que ve la persona', () => {
    expect(ids('híbrido')).toEqual(['luis']);
    expect(ids('presencial')).toEqual(['sol']);
  });
  it('con varias palabras exige todas', () => {
    expect(ids('gomez react')).toEqual(['ana']);
    expect(ids('gomez python')).toEqual([]);
  });
  it('sin coincidencias devuelve una lista vacía', () => {
    expect(ids('zzz')).toEqual([]);
  });
});
