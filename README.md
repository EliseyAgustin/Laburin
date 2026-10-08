# Laburin

![Mis postulaciones (tablero Kanban) de Laburin](docs/scripts/capturas/05-tablero.png)

Plataforma web para organizar y hacer seguimiento de una búsqueda laboral, con un motor de scoring configurable que puntúa cada oferta según las preferencias de cada usuario. Es el proyecto de la Práctica Profesional Supervisada de la Tecnicatura Universitaria en Tecnologías Web (Universidad Nacional del Oeste).

**Deploy:** https://laburin.vercel.app

## Qué hace

- **Ofertas:** carga manual o importación desde Remotive y Arbeitnow (con deduplicación). Listado paginado con filtros por fuente, ubicación y puntaje mínimo, y borrado masivo.
- **Scoring configurable:** criterios de stack, modalidad y ubicación con peso propio; al cambiarlos se recalcula el puntaje de todas las ofertas.
- **Mis postulaciones (tablero Kanban):** seis estados, con arrastrar y soltar en escritorio y un selector "Mover a..." en mobile. Guarda el historial de cambios de estado.
- **Mi perfil de búsqueda:** qué buscás (modalidad y ubicación), tus tecnologías con su peso y el aviso de seguimiento. Las URLs anteriores (`/tablero`, `/analytics`, `/configuracion`) redirigen a `/mis-postulaciones`, `/mi-progreso` y `/mi-perfil`.
- **Ficha de postulación:** línea de tiempo de interacciones (mail, llamada, entrevista, nota).
- **Recordatorios por inactividad:** aviso cuando una postulación abierta lleva N días sin novedades; N lo elige cada usuario (de 1 a 90, 7 por defecto).
- **Mi progreso (métricas):** embudo, tasa de respuesta, puntaje promedio y actividad reciente.
- **Cuenta:** registro, onboarding de 4 pasos y "Mi cuenta" (nombre, contraseña, tema claro/oscuro). Los datos de cada usuario quedan aislados con RLS.

## Stack

React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS 4 · React Router 7 · Recharts · Supabase (Auth, PostgreSQL y RLS) · Vercel · Vitest 4 · Playwright 1.63

## Correr localmente

Requisitos: Node.js y un proyecto de Supabase propio. Se probó únicamente con Node.js 25; las dependencias declaran como mínimo Node.js 22.

1. `npm install`
2. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Project Settings → API del proyecto de Supabase).
3. Aplicar las migraciones (ver la sección siguiente).
4. `npm run dev` y abrir http://localhost:3000

Si el proyecto de Supabase exige confirmar el email al registrarse, hay que confirmar la cuenta antes de poder ingresar (o desactivar esa opción en Authentication → Providers → Email).

## Base de datos

El esquema está en [`supabase/migrations/`](supabase/migrations/): tablas, políticas RLS, perfil de usuario, recordatorios, historial de estados y el umbral de inactividad. Hay que aplicar los archivos **en orden de nombre** (es el orden cronológico) en un proyecto de Supabase propio, por ejemplo pegándolos de a uno en el SQL Editor.

## Tests

| Comando | Qué corre |
|---|---|
| `npm run test` | **Vitest:** 160 tests unitarios (15 archivos) de la lógica pura: scoring, recordatorios, métricas, paginación y lotes, importación, tags y utilidades. No toca la base. |
| `npm run test:e2e` | **Playwright** (Chromium) en desktop (1280x800) y mobile (375x812): 34 tests definidos: 32 de punta a punta (16 en desktop y 16 en mobile) más 2 de preparación de sesión. En desktop uno se saltea a propósito (el del teclado virtual, solo mobile). |

Para los E2E: `npx playwright install chromium` y copiar `.env.e2e.example` a `.env.e2e`. Corren contra la base configurada en `.env`, **crean cuentas de prueba** por el flujo de registro de la app y **borran sus datos al terminar** (los usuarios de Auth quedan). Conviene usar un proyecto de desarrollo, no uno con datos reales. Más detalle y zonas ciegas en [`e2e/README.md`](e2e/README.md).

## Documentación

- `Laburin-Memoria-Tecnica.docx` y `Laburin-Manual-de-Usuario.docx` (en la raíz del repo).
- [`docs/srs.md`](docs/srs.md): especificación de requerimientos. [`legacy/jobbot-v5.gs`](legacy/jobbot-v5.gs): el script que fue el antecedente funcional.
- Para regenerar los dos documentos: `npm run docs:generar` (scripts y capturas en [`docs/scripts/`](docs/scripts/)).

## Estructura

```
src/
  components/   UI reutilizable y de layout (AppLayout, Sidebar, Topbar)
  features/     flujos multi-paso con estado propio (onboarding)
  pages/        una vista por ruta (Login, Offers, Tablero, Settings, Analytics, Onboarding)
  hooks/        useAuth, useOnboarding, useTheme
  services/     única capa que habla con Supabase, un archivo por entidad
  lib/          utilidades puras y el cliente de Supabase
  types/        interfaces TypeScript compartidas
supabase/migrations/   esquema y RLS
e2e/                   suite de Playwright
docs/                  SRS y scripts de generación de los documentos
```

## Alcance y limitaciones

El foco de esta entrega es el motor de scoring configurable y el seguimiento de cada postulación. **Quedan fuera del alcance de esta entrega:** la notificación por email, la importación periódica automática (hoy la importación se dispara a mano con un botón), cinco de las siete fuentes del antecedente (solo están Remotive y Arbeitnow), la categorización de rol y las reglas fijas de scoring del script anterior: el puntaje depende solo de los criterios que configura cada usuario. Además, el recálculo de scores es lento con más de mil ofertas y la interfaz no se probó en un celular real ni en navegadores distintos de Chromium. El detalle y la comparación punto por punto con la especificación están en las Secciones 8 y 9 de la Memoria Técnica.

## Autor

Agustín Elisey. Docente: Viviana Esterkin. Práctica Profesional Supervisada, Tecnicatura Universitaria en Tecnologías Web, Universidad Nacional del Oeste. Segundo cuatrimestre de 2026.
