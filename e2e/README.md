# Suite E2E (Playwright)

Navegador real (Chromium) contra la app levantada con Vite y la base real de Supabase.
`npm run test` sigue siendo solo Vitest; esto se corre con `npm run test:e2e`.

## Puesta en marcha

1. `npm install` y `npx playwright install chromium`.
2. Copiar `.env.e2e.example` a `.env.e2e` y completar `E2E_EMAIL`, `E2E_EMAIL_MOBILE` y `E2E_PASSWORD`
   (no se commitea). `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se leen de `.env`.
3. `npm run test:e2e` (todo) o `npx playwright test --project=desktop registro` (una spec).

La primera vez, `auth.setup.ts` crea las dos cuentas compartidas por el **flujo de registro de la app**.
No se usa ninguna service role key: la siembra y la limpieza usan el cliente de Supabase autenticado como el
usuario de prueba, así que respetan RLS igual que un usuario real.

## Proyectos

| Proyecto | Viewport | Notas |
|---|---|---|
| `desktop` | 1280x800 | Drag-and-drop nativo real |
| `mobile` | 375x812, touch | Selector "Mover a...", barra de selección, menú lateral |

Corren en serie (un solo worker): comparten la base y una cuenta por proyecto.

## Datos de prueba

- Cada test que usa la cuenta compartida arranca con la cuenta reseteada (`api.resetear()`): perfil completo,
  umbral por defecto y criterios base (React 15, remoto 10), sin ofertas.
- Las specs que cambian la contraseña o cierran sesión usan una cuenta propia, creada por el registro de la app.
- Al terminar (`global-teardown.ts`) se borran **todos los datos** de las cuentas compartidas y temporales
  (ofertas, postulaciones, interacciones, criterios y perfil). Los usuarios de Auth huérfanos se dejan.
- Remotive y Arbeitnow se interceptan con `page.route` para que el import sea determinista;
  `import-real.spec.ts` es el smoke contra los servicios reales y se saltea de forma explícita si ninguno responde.

## Zonas ciegas (lo que esta suite NO verifica)

Ver la lista actualizada en la Memoria Técnica (Sección 6). Resumen:

- **Teclado virtual real:** `mobile-teclado.spec.ts` solo simula su efecto (viewport reducido).
- **Touch real / gestos:** el drag táctil no existe en la app (se usa el selector), y Playwright emula el touch.
- **Otros motores y dispositivos:** solo Chromium. No hay WebKit/Safari/iOS ni hardware real.
- **Autoscroll durante el drag:** en desktop se desplaza el tablero antes de arrastrar; el autoscroll por
  proximidad al borde que hace el navegador al arrastrar no se verifica.
- **Fuentes externas reales:** salvo el smoke, dependen de mocks.
