# Laburin

Plataforma Web de Búsqueda y Seguimiento Laboral Automatizada con Motor de Scoring.
PPS — Tecnicatura Universitaria en Tecnologías Web, UNO. 2do Cuatrimestre 2026.

Frontend generado inicialmente con Google AI Studio (prototipos de Google Stitch), sobre Vite + React + TypeScript. Todavía no integra Supabase.

## Estructura de `src/`

```
src/
  assets/       # estilos globales (index.css) e imágenes/íconos
  components/   # componentes UI reutilizables y de layout
    layout/       # AppLayout, Sidebar, Topbar
  pages/        # vistas de nivel superior, una por ruta
  hooks/        # custom hooks de React (vacío por ahora)
  services/     # llamadas a Supabase, un archivo por entidad (vacío por ahora)
  lib/          # configuración de clientes externos (utils.ts; supabaseClient.ts a futuro)
  types/        # interfaces TypeScript compartidas (vacío por ahora)
  utils/        # funciones auxiliares puras de negocio (vacío por ahora)
  App.tsx       # router raíz
  main.tsx      # entry point
```

Organización por **tipo de archivo**, no por feature: con el tamaño actual del proyecto, separar por dominio (`features/ofertas`, `features/scoring`, etc.) generaría carpetas vacías sin contenido real. Cuando un dominio (ej. el motor de scoring o el tablero Kanban) acumule su propio hook + service + componentes, ese es el momento de moverlo a una carpeta `features/<dominio>/` dedicada.

El alias `@` apunta a `src/` (configurado en `vite.config.ts` y `tsconfig.json`), por ejemplo `@/lib/utils`, `@/components/layout/Sidebar`.

## Otros directorios

- [`docs/srs.md`](docs/srs.md) — Especificación de Requerimientos (Semana 1)
- [`legacy/jobbot-v5.gs`](legacy/jobbot-v5.gs) — Antecedente funcional (Google Apps Script), referencia histórica para el relevamiento de reglas de negocio. No se ejecuta dentro de Laburin.

## Estado conocido

- `src/pages/Login.tsx` está vacío; `App.tsx` lo importa, por lo que el build de producción (`npm run build`) falla hasta que se implemente. Pendiente, fuera del alcance de la reorganización de carpetas.

## Correr localmente

**Requisitos:** Node.js

1. Instalar dependencias: `npm install`
2. Configurar `GEMINI_API_KEY` en `.env`
3. Levantar la app: `npm run dev`
