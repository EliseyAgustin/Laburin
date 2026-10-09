import { describe, expect, it } from 'vitest';
import { RUTAS } from '@/lib/rutas';
import { rolDesdeFila, rutaInicialPorRol, rutaPermitidaParaRol } from '@/lib/rol';

describe('rolDesdeFila', () => {
  it('sin fila en roles_usuario es candidato', () => {
    expect(rolDesdeFila(null)).toBe('candidato');
    expect(rolDesdeFila(undefined)).toBe('candidato');
  });
  it('reconoce al administrador', () => {
    expect(rolDesdeFila({ rol: 'administrador' })).toBe('administrador');
  });
  it('cualquier otro valor se trata como candidato', () => {
    expect(rolDesdeFila({ rol: 'candidato' })).toBe('candidato');
    expect(rolDesdeFila({ rol: 'superusuario' })).toBe('candidato');
  });
});

describe('rutaInicialPorRol', () => {
  it('el administrador cae en Candidatos y el candidato en Mis postulaciones', () => {
    expect(rutaInicialPorRol('administrador')).toBe(RUTAS.candidatos);
    expect(rutaInicialPorRol('candidato')).toBe(RUTAS.postulaciones);
  });
});

describe('rutaPermitidaParaRol', () => {
  it('un candidato no puede entrar a Candidatos, ni a su detalle', () => {
    expect(rutaPermitidaParaRol('candidato', '/candidatos')).toBe(false);
    expect(rutaPermitidaParaRol('candidato', '/candidatos/abc-123')).toBe(false);
  });
  it('un candidato sí entra a sus pantallas, incluidos los mensajes', () => {
    for (const ruta of [RUTAS.ofertas, RUTAS.postulaciones, RUTAS.progreso, RUTAS.perfil, RUTAS.mensajes]) {
      expect(rutaPermitidaParaRol('candidato', ruta), ruta).toBe(true);
    }
  });
  it('el administrador solo entra a Candidatos', () => {
    expect(rutaPermitidaParaRol('administrador', '/candidatos')).toBe(true);
    expect(rutaPermitidaParaRol('administrador', '/candidatos/abc-123')).toBe(true);
    for (const ruta of [RUTAS.ofertas, RUTAS.postulaciones, RUTAS.progreso, RUTAS.perfil, RUTAS.mensajes]) {
      expect(rutaPermitidaParaRol('administrador', ruta), ruta).toBe(false);
    }
  });
  it('no se confunde con rutas que solo empiezan parecido', () => {
    expect(rutaPermitidaParaRol('candidato', '/candidatos-falsos')).toBe(true);
    expect(rutaPermitidaParaRol('administrador', '/candidatos-falsos')).toBe(false);
  });
});
