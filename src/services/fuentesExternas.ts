import { claveDedupeOferta } from '@/lib/fuentes';
import { crearOferta, listarClavesOfertasExistentes } from '@/services/ofertas';
import type { Oferta, OfertaInput } from '@/types/oferta';

const REMOTIVE_URL = 'https://remotive.com/api/remote-jobs?limit=100';
const ARBEITNOW_URL = 'https://www.arbeitnow.com/api/job-board-api';

export { claveDedupeOferta };

export interface RemotiveJob {
  title: string;
  company_name: string;
  candidate_required_location: string;
  tags: string[];
  publication_date: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

export interface ArbeitnowJob {
  company_name: string;
  title: string;
  location: string;
  remote: boolean;
  tags: string[];
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

export function normalizarRemotive(job: RemotiveJob): OfertaInput {
  return {
    empresa: job.company_name,
    rol: job.title,
    ubicacion: job.candidate_required_location?.trim() || null,
    modalidad: 'remoto',
    stack_tecnologico: job.tags ?? [],
    fuente: 'Remotive',
    fecha_publicacion: job.publication_date ? job.publication_date.slice(0, 10) : null,
  };
}

export function normalizarArbeitnow(job: ArbeitnowJob): OfertaInput {
  return {
    empresa: job.company_name,
    rol: job.title,
    ubicacion: job.location?.trim() || null,
    modalidad: 'remoto',
    stack_tecnologico: job.tags ?? [],
    fuente: 'Arbeitnow',
    fecha_publicacion: job.created_at ? new Date(job.created_at * 1000).toISOString().slice(0, 10) : null,
  };
}

export async function importarDeRemotive(): Promise<OfertaInput[]> {
  const res = await fetch(REMOTIVE_URL);
  if (!res.ok) throw new Error(`Remotive respondió ${res.status}`);

  const data = (await res.json()) as RemotiveResponse;
  return data.jobs.map(normalizarRemotive);
}

export async function importarDeArbeitnow(): Promise<OfertaInput[]> {
  const res = await fetch(ARBEITNOW_URL);
  if (!res.ok) throw new Error(`Arbeitnow respondió ${res.status}`);

  const data = (await res.json()) as ArbeitnowResponse;
  return data.data.filter((job) => job.remote).map(normalizarArbeitnow);
}

export interface ResultadoImportacion {
  insertadas: Oferta[];
  omitidasPorDuplicado: number;
  erroresInsercion: number;
  fuentesFallidas: string[];
}

// Separa las candidatas que todavía no existen. `existentes` son claves ya normalizadas con claveDedupeOferta.
export function separarNuevas(
  candidatos: OfertaInput[],
  existentes: Set<string>
): { nuevas: OfertaInput[]; omitidasPorDuplicado: number } {
  const vistos = new Set(existentes);
  const nuevas: OfertaInput[] = [];
  let omitidasPorDuplicado = 0;

  for (const candidato of candidatos) {
    const clave = claveDedupeOferta(candidato);
    if (vistos.has(clave)) {
      omitidasPorDuplicado++;
      continue;
    }
    vistos.add(clave);
    nuevas.push(candidato);
  }

  return { nuevas, omitidasPorDuplicado };
}

export async function importarOfertasRemotas(): Promise<ResultadoImportacion> {
  const fuentesFallidas: string[] = [];

  const [remotive, arbeitnow] = await Promise.allSettled([importarDeRemotive(), importarDeArbeitnow()]);

  const candidatos: OfertaInput[] = [];
  if (remotive.status === 'fulfilled') candidatos.push(...remotive.value);
  else fuentesFallidas.push('Remotive');

  if (arbeitnow.status === 'fulfilled') candidatos.push(...arbeitnow.value);
  else fuentesFallidas.push('Arbeitnow');

  // No depende de tener cargadas las ofertas: se consultan solo las claves de las fuentes candidatas.
  const fuentes = [...new Set(candidatos.map((c) => c.fuente).filter((f): f is string => !!f))];
  const existentes = await listarClavesOfertasExistentes(fuentes);
  const { nuevas, omitidasPorDuplicado } = separarNuevas(candidatos, existentes);

  const insertadas: Oferta[] = [];
  let erroresInsercion = 0;

  for (const oferta of nuevas) {
    try {
      insertadas.push(await crearOferta(oferta));
    } catch {
      erroresInsercion++;
    }
  }

  return { insertadas, omitidasPorDuplicado, erroresInsercion, fuentesFallidas };
}

export function resumenImportacion(resultado: ResultadoImportacion): string {
  const { insertadas, omitidasPorDuplicado, erroresInsercion, fuentesFallidas } = resultado;

  const partes = [
    insertadas.length === 1 ? '1 oferta nueva importada' : `${insertadas.length} ofertas nuevas importadas`,
  ];
  if (omitidasPorDuplicado > 0) {
    partes.push(omitidasPorDuplicado === 1 ? '1 duplicada omitida' : `${omitidasPorDuplicado} duplicadas omitidas`);
  }
  if (erroresInsercion > 0) {
    partes.push(erroresInsercion === 1 ? '1 falló al guardar' : `${erroresInsercion} fallaron al guardar`);
  }
  if (fuentesFallidas.length > 0) {
    partes.push(`no se pudo consultar: ${fuentesFallidas.join(', ')}`);
  }
  return partes.join(' · ');
}
