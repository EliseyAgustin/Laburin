# Reporte E2E — Laburin

**Metodología (distinta a la del `reporte-qa.md` anterior):** no tengo navegador en esta sesión, así que no pude clickear los flujos como pediste. En cambio usé dos fuentes de evidencia, combinadas:

1. **Backend real:** un script temporal (`e2e-script.mjs`, borrado al terminar) que usó la misma clave anon de tu `.env` contra tu Supabase real — no un mock ni un Postgres descartable. Creó un usuario de prueba genuino, pasó por las mismas tablas, triggers, RLS y constraints que usa la app, y verificó 33 afirmaciones concretas. **33/33 en verde.** Al final borré todas las filas de datos (ofertas, postulaciones, interacciones, recordatorios, criterios, perfil) — lo único que no pude borrar con la anon key es el usuario de Auth en sí (hace falta la service role key o borrarlo a mano desde el dashboard).
2. **Trazado de código** para todo lo que es puramente de React (qué se re-renderiza, qué se re-fetchea al navegar, qué le llega a cada componente) — esto no lo prueba un script de backend, pero conozco esta base de código a fondo porque construí casi todo en esta sesión.

Lo que **ninguna de las dos cosas** reemplaza: la experiencia real en un navegador (drag táctil, timing de clicks, cómo se ve en mobile). Eso lo marco explícitamente donde corresponde.

**Usuario de prueba que quedó en tu Supabase (Auth únicamente, sin datos):** `e2e-laburin-test-1790946296226@gmail.com` — podés borrarlo desde el dashboard (Authentication → Users) cuando quieras, no tiene ninguna fila asociada.

---

## Flujo 1 — Alta de usuario de punta a punta

**Verificado contra Supabase real:**
- `signUp` crea el usuario y devuelve sesión inmediata — este proyecto no exige confirmación de email, así que el flujo Registro → Onboarding sin pasos intermedios funciona tal como está armado.
- `perfil_usuario` se guarda con `onboarding_completado: true`.
- Los 4 criterios esperados (2 de stack, 1 de modalidad, 1 de ubicación) se crean con el `peso`/`tipo_coincidencia`/`campo_objetivo` que arma `construirCriterio`.

**Por trazado de código:**
- `OnboardingWizard.finish()` hace `await completarOnboarding(...)` → `await refresh()` → `navigate('/tablero')`, en ese orden. El `refresh()` deja `OnboardingProvider` en `status: 'completo'` **antes** de navegar, así que si el usuario después intenta ir a `/onboarding` a mano, `Onboarding.tsx` lo redirige a `/tablero` — no hay forma de "repetir" el onboarding por accidente.
- Configuración (`Settings.tsx`) hace `listarCriterios()` en su propio `useEffect` de montaje — como cada página es una ruta hermana distinta (ver nota de routing al final), al entrar a Configuración por primera vez después del onboarding, los 4 criterios recién creados van a aparecer sin necesidad de recargar nada.

**Hallazgo:** ninguno. Sin diferencia esperable entre desktop y mobile acá (es un formulario, ya cubierto en la etapa de responsive).

---

## Flujo 2 — Ciclo de vida completo de una oferta

**Verificado contra Supabase real:**
- Oferta creada con score calculado correctamente (15+10+5=30 para una oferta que matchea los 3 criterios).
- Postulación nace en `por_aplicar` (el default de la base, consistente con la decisión que tomamos en su momento).
- El trigger de historial registró la fila inicial (`null → por_aplicar`) solo.
- Recorrí las 5 etapas (por_aplicar → aplicado → en_proceso → entrevista → oferta) con la misma función (`datosCambioEstado`) que usan tanto el drag de desktop como el `<select>` de mobile — **es literalmente el mismo código**, así que no hay forma de que el historial se vea distinto según el dispositivo.
- `fecha_postulacion` se completó sola al salir de "por_aplicar", como quedó definido.
- El historial final tiene exactamente las 5 transiciones en el orden correcto — esto lo escribe un trigger de Postgres, no código de React, así que es imposible que quede un "hueco" por un bug de frontend (aunque el usuario cierre la pestaña a mitad de camino, lo que ya se guardó, se guardó).
- 3 interacciones de distinto tipo se crearon; borrar una dejó exactamente 2, confirmado con una consulta nueva (no con el estado de la sesión del script) — es lo mismo que "recargar la página".

**Por trazado de código:**
- `ApplicationDetailPanel` recibe `postulacionId` como prop y su `useEffect` depende de ese id — cada vez que se abre la Ficha (desde el Tablero o desde Ofertas) vuelve a pedir todo fresco a Supabase. No hay caché que se pueda quedar vieja entre abrir y cerrar la Ficha.

**Hallazgo:** ninguno en la cadena de datos. Lo que **no pude probar** es el gesto de drag en sí (sensación táctil, si "se pega" visualmente, si el drop zone se siente bien) — eso depende de renderizado real, no de que el dato final sea correcto.

---

## Flujo 3 — Import + scoring + filtros + bulk delete

**Verificado contra Supabase real:**
- Traje candidatos reales de Remotive y Arbeitnow (las APIs públicas reales, no datos de prueba) y los inserté con `puntaje_scoring` ya calculado — ninguno quedó en `null`.
- Los 3 filtros (fuente, ubicación, score mínimo) los apliqué por separado sobre los datos reales recién cargados y cada uno encontró exactamente lo esperado.
- El bulk delete borró exactamente los ids pasados — ni la oferta manual ni el resto de las importadas se tocaron.

**Por trazado de código:**
- Los 3 filtros se combinan con **AND** (`ofertasFiltradas` es una cadena de `if` que van descartando) — si combinás fuente + ubicación + score mínimo, el resultado es la intersección de los tres, no la unión. Esto es importante tenerlo claro al probarlo vos: si un filtro combinado "no muestra nada", puede ser correcto (no hay ninguna oferta que cumpla las tres condiciones a la vez), no necesariamente un bug.
- La selección múltiple ya está acotada a `ofertasFiltradas` (lo que se ve en pantalla con el filtro activo) — confirmado en el código de la Parte de selección múltiple, no solo en este script.

**Hallazgo:** ninguno.

---

## Flujo 4 — Configuración afectando el scoring en vivo

**Verificado contra Supabase real:**
- Subir el peso de un criterio existente de 15 a 25 y recalcular recalculó la oferta ya cargada de 30 a 40 puntos — el cambio impacta ofertas que **ya existían antes** del cambio, no solo las nuevas.
- Agregar un criterio nuevo que matcheaba una oferta ya cargada le sumó los puntos nuevos (0 → 23).

**Por trazado de código, el punto que vos específicamente pediste confirmar ("no quedó con el valor viejo cacheado"):**
- `actualizarCriterio`/`crearCriterio` llaman a `recalcularTodosLosScores(user.id)` **adentro del propio service**, antes de que la función `async` termine — no es algo que dependa de que el componente de React "se acuerde" de disparar un recálculo por separado.
- Ofertas (`Offers.tsx`) no guarda ningún score en una variable global ni en memoria compartida entre páginas — cada vez que se monta (cada vez que navegás ahí, confirmado por el routing) vuelve a pedir la lista completa a Supabase. Por diseño, **no hay ningún lugar donde un score viejo pueda quedar cacheado** entre Configuración y Ofertas.

**Hallazgo:** ninguno.

---

## Flujo 5 — Recordatorios por inactividad

**Verificado contra Supabase real** (simulé el umbral insertando una postulación con `created_at` de hace 10 días en vez de esperar — es lo único razonable para probar esto sin perder una semana):
- La lógica de detección encontró correctamente la postulación inactiva.
- El recordatorio se guardó y aparece como `activo` — es exactamente lo que leerían el badge del Tablero y el banner de la Ficha.
- Resolverlo y volver a correr la detección **inmediatamente después** no generó un duplicado — confirma en la base real la regla que ya estaba unit-testeada ("resolver pausa la alerta"), con el índice único real de por medio.

**Hallazgo:** ninguno. Nota aparte: no hay forma de "adelantar" esto desde la UI real — si vos querés probarlo en tu propio navegador, no hay atajo salvo backdatear una fila a mano en el SQL Editor (te paso la consulta si la querés: `update postulaciones set created_at = now() - interval '10 days' where id = '...'`).

---

## Flujo 6 — Sesión y navegación

**Verificado contra Supabase real:**
- Sin sesión, una consulta a `ofertas` devuelve vacío (RLS), no un error — es el equivalente de backend de "la app no explota, simplemente no hay nada que mostrar" antes de que `ProtectedRoute` redirija.
- Cerrar sesión y volver a loguearse con las mismas credenciales funciona, y los datos cargados antes siguen ahí.

**Por trazado de código:**
- `ProtectedRoute.tsx`: `if (!session) return <Navigate to="/" replace />` — con la sesión en `null` (confirmado que el backend la devuelve vacía en ese estado), esto redirige a Login. No pude ver el redirect en un navegador, pero la condición que lo dispara está confirmada.
- `src/lib/supabase.ts`: el cliente se crea sin opciones, así que usa los defaults de la librería — **`autoRefreshToken: true`**. Una pestaña abierta mucho tiempo debería refrescar el token sola, en silencio, sin que el usuario note nada. No pude dejar una pestaña abierta horas para verlo en vivo (ni tengo navegador para tener una pestaña), así que esto queda en "confirmado por configuración, no observado en ejecución".

**Hallazgo:** ninguno confirmado. Si alguna vez ves que una sesión muy vieja se comporta raro (no solo "me desconectó", sino algo roto a medias), avisame — eso sí ameritaría investigar más.

---

## Nota de routing (aplica a varios flujos de arriba)

Tablero, Ofertas, Analytics y Configuración son rutas **hermanas** bajo el mismo layout (`AppLayout`). React Router desmonta el componente de la página anterior y monta uno nuevo cada vez que cambiás de ruta entre ellas (el Sidebar/Topbar no se remonta, pero cada página sí). Como ninguna de las 4 páginas guarda nada en un store global — todo es `useState` local que se pierde al desmontar — **no existe ningún lugar donde pueda quedar un dato viejo cacheado entre pantallas**. Cada vez que entrás a una pantalla, se pide todo de nuevo. Esto es la razón de fondo por la que los Flujos 3 y 4 (scoring recalculado, filtros) deberían andar bien en la práctica: no es que lo haya "probado y salió bien", es que el patrón de la app hace que ese tipo de bug sea estructuralmente difícil que ocurra.

---

## Lo que no pude verificar (necesita tu navegador)

Ninguno de estos es un hallazgo — son honestamente zonas ciegas de mi metodología, no bugs confirmados ni descartados:

1. **Sensación real del drag-and-drop** en desktop (si se "traba", si el drop zone da buen feedback visual).
2. **Mobile real** (no DevTools): el `<select>` del Kanban, el teclado tapando campos, el touch de los botones — todo esto ya lo auditamos y corregimos en la etapa de Usabilidad & Mobile, pero esta vez no lo volví a tocar porque no encontré nada que lo pusiera en duda.
3. **Timing de clicks reales** (doble tap, cancelar a mitad de una animación) — ya cubierto en el pase de QA anterior; no encontré motivo para sospechar que algo nuevo se rompió.
4. **Token realmente vencido** (no solo "configurado para refrescar sólo") — requeriría dejar una pestaña abierta varias horas o manipular el reloj del sistema.
5. **Mirar Analytics con tus propios ojos** después de un flujo real — ya confirmé que los números se recalculan bien (Flujos 2-4), pero no rendericé los 4 gráficos para ver si "a ojo" cuentan la historia correcta. Esto es puramente visual, no de datos.

---

## Hallazgos nuevos

**Ninguno.** Las 33 verificaciones contra el backend real pasaron, y el trazado de código no encontró ningún punto de corte entre pantallas. Esto no significa "la app está perfecta" — significa que, con la metodología disponible en esta sesión (sin navegador), no encontré nada roto en las cadenas de datos que pediste revisar.

---

## Sugerencias (fuera de alcance, no implementadas — a pedido tuyo)

- El umbral de 7 días de `generarRecordatorios` no tiene forma de probarse desde la UI sin esperar o tocar la base a mano. Si en algún momento agregan una pantalla de administración/debug, un botón de "simular paso del tiempo" solo en `import.meta.env.DEV` facilitaría mucho el testing manual futuro — mismo criterio que ya usamos con "datos de ejemplo" en Registro.
- El script que usé para este pase (ya borrado) podría convertirse en un test de integración real dentro de `npm run test` si alguna vez quieren correr este tipo de verificación de forma repetible contra un proyecto de Supabase de staging — hoy no existe ese ambiente separado, así que no lo armé como test permanente (correría contra producción en cada `npm test`, que no es lo que querés).
