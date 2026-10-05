import { describe, expect, it } from 'vitest';
import { claveDedupeOferta, normalizarArbeitnow, normalizarRemotive, resumenImportacion, separarNuevas } from '@/services/fuentesExternas';
import type { Oferta } from '@/types/oferta';

describe('normalizarRemotive', () => {
  it('mapea un job de Remotive al shape de OfertaInput', () => {
    const job = {
      id: 2091129,
      url: 'https://remotive.com/remote-jobs/data/senior-data-scientist-2091129',
      title: 'Senior Data Scientist',
      company_name: 'Lemon.io',
      tags: ['python', 'AI/ML', 'react'],
      job_type: 'full_time',
      publication_date: '2026-09-16T12:35:28',
      candidate_required_location: 'Northern America, LATAM, Europe, APAC',
      salary: '',
    };

    expect(normalizarRemotive(job)).toEqual({
      empresa: 'Lemon.io',
      rol: 'Senior Data Scientist',
      ubicacion: 'Northern America, LATAM, Europe, APAC',
      modalidad: 'remoto',
      stack_tecnologico: ['python', 'AI/ML', 'react'],
      fuente: 'Remotive',
      fecha_publicacion: '2026-09-16',
    });
  });

  it('usa null en ubicacion y fecha_publicacion cuando el job no los trae', () => {
    const job = {
      id: 1,
      url: 'https://remotive.com/x',
      title: 'Dev',
      company_name: 'Acme',
      tags: [],
      job_type: 'full_time',
      publication_date: '',
      candidate_required_location: '',
      salary: '',
    };

    const resultado = normalizarRemotive(job);
    expect(resultado.ubicacion).toBeNull();
    expect(resultado.fecha_publicacion).toBeNull();
  });
});

describe('normalizarArbeitnow', () => {
  it('mapea un job de Arbeitnow al shape de OfertaInput, incluyendo la fecha unix a ISO', () => {
    const job = {
      slug: 'motion-designer-berlin-209101',
      company_name: 'Paintgun',
      title: 'Motion Designer',
      remote: true,
      url: 'https://www.arbeitnow.com/jobs/companies/paintgun/motion-designer-berlin-209101',
      tags: ['Remote', 'Graphic Arts and Communication Design'],
      job_types: ['Freelance'],
      location: 'Berlin',
      created_at: 1789732849,
    };

    expect(normalizarArbeitnow(job)).toEqual({
      empresa: 'Paintgun',
      rol: 'Motion Designer',
      ubicacion: 'Berlin',
      modalidad: 'remoto',
      stack_tecnologico: ['Remote', 'Graphic Arts and Communication Design'],
      fuente: 'Arbeitnow',
      fecha_publicacion: '2026-09-18',
    });
  });

  it('usa null en ubicacion cuando el job no trae location', () => {
    const job = {
      slug: 'x',
      company_name: 'Acme',
      title: 'Dev',
      remote: true,
      url: 'https://www.arbeitnow.com/x',
      tags: [],
      job_types: [],
      location: '',
      created_at: 1789732849,
    };

    expect(normalizarArbeitnow(job).ubicacion).toBeNull();
  });
});

function ofertaFixture(overrides: Partial<Oferta> = {}): Oferta {
  return {
    id: '1',
    user_id: 'u1',
    empresa: 'Acme',
    rol: 'QA Analyst',
    ubicacion: null,
    modalidad: 'remoto',
    stack_tecnologico: [],
    fuente: 'Remotive',
    fecha_publicacion: null,
    puntaje_scoring: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('claveDedupeOferta', () => {
  it('genera la misma clave para empresa+rol+fuente iguales ignorando mayúsculas y espacios', () => {
    const a = claveDedupeOferta(ofertaFixture({ empresa: 'Acme', rol: 'QA Analyst', fuente: 'Remotive' }));
    const b = claveDedupeOferta(ofertaFixture({ empresa: '  acme ', rol: 'qa analyst', fuente: 'REMOTIVE' }));
    expect(a).toBe(b);
  });

  it('genera claves distintas si cambia la fuente', () => {
    const a = claveDedupeOferta(ofertaFixture({ fuente: 'Remotive' }));
    const b = claveDedupeOferta(ofertaFixture({ fuente: 'Arbeitnow' }));
    expect(a).not.toBe(b);
  });

  it('genera claves distintas si cambia el rol', () => {
    const a = claveDedupeOferta(ofertaFixture({ rol: 'QA Analyst' }));
    const b = claveDedupeOferta(ofertaFixture({ rol: 'QA Engineer' }));
    expect(a).not.toBe(b);
  });
});

describe('separarNuevas', () => {
  const cand = (empresa: string, rol: string, fuente = 'Remotive') => ({
    empresa,
    rol,
    fuente,
    ubicacion: null,
    modalidad: 'remoto' as const,
    stack_tecnologico: [],
    fecha_publicacion: null,
  });

  it('omite las que ya existen, sin importar mayúsculas ni espacios', () => {
    const existentes = new Set([claveDedupeOferta({ empresa: 'acme', rol: 'dev', fuente: 'remotive' })]);
    const r = separarNuevas([cand(' ACME ', 'Dev'), cand('Otra', 'Dev')], existentes);
    expect(r.nuevas.map((o) => o.empresa)).toEqual(['Otra']);
    expect(r.omitidasPorDuplicado).toBe(1);
  });

  it('deduplica repetidas dentro del propio lote de candidatas', () => {
    const r = separarNuevas([cand('Acme', 'Dev'), cand('Acme', 'Dev')], new Set());
    expect(r.nuevas).toHaveLength(1);
    expect(r.omitidasPorDuplicado).toBe(1);
  });

  it('la misma empresa y rol en otra fuente no es duplicado', () => {
    const existentes = new Set([claveDedupeOferta({ empresa: 'Acme', rol: 'Dev', fuente: 'Arbeitnow' })]);
    expect(separarNuevas([cand('Acme', 'Dev', 'Remotive')], existentes).nuevas).toHaveLength(1);
  });
});

describe('resumenImportacion', () => {
  const base = { insertadas: [], omitidasPorDuplicado: 0, erroresInsercion: 0, fuentesFallidas: [] as string[] };
  const nuevas = (n: number) => Array.from({ length: n }, () => ({}) as Oferta);

  it('concuerda en plural con cero y con varias', () => {
    expect(resumenImportacion({ ...base, insertadas: nuevas(0) })).toBe('0 ofertas nuevas importadas');
    expect(resumenImportacion({ ...base, insertadas: nuevas(8) })).toBe('8 ofertas nuevas importadas');
  });

  it('concuerda en singular con una', () => {
    expect(resumenImportacion({ ...base, insertadas: nuevas(1) })).toBe('1 oferta nueva importada');
    expect(resumenImportacion({ ...base, omitidasPorDuplicado: 1 })).toBe(
      '0 ofertas nuevas importadas · 1 duplicada omitida'
    );
  });

  it('incluye duplicadas, errores y fuentes caídas', () => {
    expect(
      resumenImportacion({
        insertadas: nuevas(2),
        omitidasPorDuplicado: 3,
        erroresInsercion: 1,
        fuentesFallidas: ['Remotive'],
      })
    ).toBe('2 ofertas nuevas importadas · 3 duplicadas omitidas · 1 falló al guardar · no se pudo consultar: Remotive');
  });
});
