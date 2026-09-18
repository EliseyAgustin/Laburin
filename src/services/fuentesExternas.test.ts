import { describe, expect, it } from 'vitest';
import { claveDedupeOferta, normalizarArbeitnow, normalizarRemotive } from '@/services/fuentesExternas';
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
