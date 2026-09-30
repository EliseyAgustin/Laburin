# Reporte de QA — Laburin

**Metodología:** auditoría por lectura de código, no por interacción real con la UI (no tengo navegador disponible en esta sesión). Para cada hallazgo cito el archivo y la línea, y describo el mecanismo exacto por el que se produce, no una sospecha genérica. Donde no pude confirmar el mecanismo con certeza, lo digo explícitamente.

**Estado de los 4 bugs reportados antes de este pase:** ya corregidos y en producción (commits `f4a6f54`, `fd80dc8`). Los reviso más abajo para confirmar por código que el fix sigue en pie, no para corregirlos de nuevo.

**Estado final de este reporte:** I-1, I-2, I-3, M-1 y M-2 corregidos. M-3 y M-4 quedan afuera a propósito (ver el cierre al final del documento).

---

## Bloqueantes

Ninguno encontrado. No hay ningún camino que deje la app inutilizable o pierda datos de forma irreversible sin confirmación previa.

---

## Importantes

### ✅ CORREGIDO — I-1. Peso de criterios: el campo se "pega" en 0 al editar (el bug que reportaste)

- **Pantalla:** Configuración → Stack Tecnológico / Modalidad / Ubicación (edición de un criterio **ya existente**, no el formulario de "agregar nuevo").
- **Causa exacta:** `Settings.tsx:90-92`, `handlePesoChange`:
  ```ts
  const peso = Number(valor);
  setCriterios((prev) => prev.map((c) => (c.id === id ? { ...c, peso: Number.isNaN(peso) ? c.peso : peso } : c)));
  ```
  `Number('')` es `0`, no `NaN`. Al borrar el campo para reescribirlo, este código pone `peso = 0` en el mismo instante, y como el input es controlado (`value={c.peso}`), React repinta el campo a "0" antes de que el usuario termine de borrar — el borrado nunca "gana". Escribir después "123" da "0123".
- **Pasos para reproducir:** Configuración → cualquier criterio existente con peso ≠ 0 → tocar el campo de peso → borrar todos los dígitos → escribir un número nuevo.
- **Qué pasa:** el 0 queda pegado adelante del número nuevo.
- **Qué debería pasar:** el campo debería poder vaciarse mientras se edita, y confirmar el nuevo valor recién al salir del campo.
- **Nota:** los campos de "agregar nuevo" (Stack/Modalidad/Ubicación) **no tienen este bug** — guardan el texto crudo en un estado string aparte y solo lo convierten a número al enviar el formulario. El problema es específico de la edición inline de un criterio existente.
- **Severidad:** importante (afecta el flujo principal de configurar el scoring, en mobile es directamente inutilizable para corregir un valor).
- **Fix:** estado `pesoDrafts` aparte por criterio en `Settings.tsx` — mientras se edita, el input muestra el texto crudo (puede quedar vacío sin que nada lo repinte); recién al perder el foco se parsea y se guarda. Sumé `onFocus={(e) => e.target.select()}` de regalo, para que un solo tap seleccione todo el valor.

### ✅ CORREGIDO — I-2. Sin límite superior en "Peso (Pts)" — puede romper el guardado con un error críptico

- **Pantalla:** Configuración, los 7 campos numéricos (3 edición inline + 3 alta nueva + Umbral de Inactividad, este último no persiste nada todavía).
- **Causa exacta:** ningún `<input type="number">` de la app tiene `max` (confirmé por grep que es el único `max` que existe en todo el código es el slider de Score Mínimo en Ofertas, que al ser un slider no se puede forzar por teclado). La columna `criterios_scoring.peso` en la base es `numeric(5, 2)` (`supabase/migrations/20260904120000_schema.sql:80`), o sea que **la base ya rechaza** cualquier valor ≥ 1000 — no hay riesgo de corrupción de datos, pero sí una mala experiencia: el usuario escribe un número gigante, el `onBlur` intenta guardar, Supabase devuelve un error de overflow numérico, y eso ahora se muestra como texto de error real (gracias al fix de `mensajeDeError` de la etapa anterior) pero sigue siendo un mensaje técnico, no algo que un usuario entienda.
- **Adicional:** tampoco hay `min`, así que un peso **negativo** es técnicamente aceptado y se guarda sin aviso. El motor de scoring (`calcularScoring`) simplemente suma los pesos de los criterios que matchean — un peso negativo silenciosamente le resta puntos a una oferta que matchea ese criterio, en vez de sumarle. No hay indicación en la SRS de que esto sea una feature buscada ("penalizar"); parece un descuido, no un diseño.
- **Pasos para reproducir:** Configuración → cualquier campo de peso → escribir `999999999` o `-50`.
- **Qué pasa:** con un número muy grande, error técnico de Supabase al perder foco. Con un número negativo, se guarda sin aviso y resta puntos.
- **Qué debería pasar:** un tope razonable (pediste ~3 cifras) validado en el cliente, y un piso en 0 salvo que quieras exponer "penalización" como feature real más adelante.
- **Severidad:** importante (el caso negativo es silencioso y afecta el scoring real de las ofertas).
- **Fix:** `clampPeso()` en `criteriosScoring.ts` (0-999, con 5 tests), aplicado en los 6 inputs de peso reales (edición + alta) antes de guardar. Sumé `min`/`max` en el HTML como pista visual.

### ✅ CORREGIDO — I-3. "Cancelar" en el modal de oferta no cancela el guardado en curso

- **Pantalla:** Ofertas → Nueva oferta / Editar oferta.
- **Causa exacta:** `OfertaFormModal.tsx:86-92` (botón X) y `:192-198` (botón "Cancelar") no tienen `disabled={saving}`. Si el usuario toca "Guardar cambios"/"Crear oferta" y, mientras la request está en vuelo, toca "Cancelar", el modal se cierra — pero el `fetch` a Supabase sigue viajando en segundo plano y, si termina bien, la oferta se crea/edita igual, apareciendo en la grilla sin que el usuario lo espere (pensó que había cancelado). Comparado con `ConfirmarEliminacionModal`, que sí deshabilita "Cancelar" mientras `eliminando` está en curso — este es el único modal de la app que no sigue ese mismo criterio.
- **Pasos para reproducir:** abrir "Nueva oferta", completar los campos, tocar "Crear oferta", y en la misma fracción de segundo tocar "Cancelar" (más fácil de reproducir con conexión lenta, en DevTools con throttling).
- **Qué pasa:** el modal se cierra creyendo que se canceló, pero la oferta se crea de todos modos.
- **Qué debería pasar:** "Cancelar"/X deshabilitados mientras `saving` está en curso, igual que en el modal de borrado.
- **Severidad:** importante (comportamiento inesperado, aunque no pierde datos — al revés, crea algo que el usuario no esperaba).
- **Fix:** `disabled={saving}` en el botón X y en "Cancelar" de `OfertaFormModal.tsx`, mismo criterio que ya tenía `ConfirmarEliminacionModal`.

---

## Menores

### ✅ CORREGIDO — M-1. Ningún campo de texto tiene límite de longitud

- Confirmé por grep: cero inputs de texto en toda la app tienen `maxLength` (Empresa, Rol, Ubicación, tags de Stack, Email, Contraseña, Rol buscado del Onboarding, notas de interacciones, nombre de zona en Configuración). Postgres no se rompe (son columnas `text`, sin límite), pero un `rol`/`empresa` muy largo en una tarjeta de Ofertas (`Offers.tsx`, sin `truncate`/`line-clamp`) puede estirar la tarjeta de forma fea, y un tag de stack muy largo puede romper el `flex-wrap` de la lista de tags.
- **Severidad:** menor (estético, no funcional).
- **Fix:** `maxLength` en los 11 campos reales de la app: Empresa/Rol/Ubicación (100) y Stack (50) en `OfertaFormModal.tsx`; Rol buscado (100), Stack (50) y Ubicación (100) del Onboarding; Email (254) y Contraseña (128) en `Login.tsx`; filtro de Ubicación en Ofertas (100); Stack (50) y Ubicación/zona (100) en Configuración; Notas de interacciones (500) en la Ficha. **Dejé afuera** el buscador del Topbar: no tiene `value`/`onChange`, es un input inerte de un mockup anterior que no procesa nada — un `maxLength` ahí no protegería nada real.

### ✅ CORREGIDO — M-2. Sin feedback visual mientras se verifica la sesión

- `ProtectedRoute.tsx:8`: `if (loading) return null;` — con conexión lenta, la pantalla queda en blanco (sin spinner) durante la verificación inicial de sesión, antes de decidir si mostrar la app o redirigir a Login.
- **Severidad:** menor.
- **Fix:** `Loader2` de `lucide-react` (la misma librería de íconos de toda la app) con `animate-spin`, centrado en pantalla completa.

### M-3. Duplicados casi-idénticos en tags de Stack (mayúsculas/espacios) — **afuera de este pase, a pedido tuyo**

- `OfertaFormModal.tsx` y `StackStep.tsx` del Onboarding: la detección de duplicados es `!stack.includes(value)`, comparación exacta de string. "React" y "react " (con espacio) se guardan como dos tags distintos.
- **Severidad:** menor (cosmético, no rompe el scoring: `calcularScoring` usa `includes` case-insensitive sobre el array, así que ambos tags igual matchean el mismo criterio).

### M-4. Límite de 1000 filas de Supabase (ya lo habíamos hablado) — **afuera de este pase, a pedido tuyo**

- No es un hallazgo nuevo de este pase — lo marqué en la Parte 4 de fuentes externas: `listarOfertas()` no pagina, y el límite por defecto de Supabase es 1000 filas. Con "muchos datos cargados" (categoría que pediste testear), superado ese número, la deduplicación del importador dejaría de ver las ofertas más viejas y podría reimportarlas. Lo dejo anotado acá para que quede en el mismo documento que el resto, no como hallazgo nuevo.
- **Severidad:** menor hoy (lejos de 1000 ofertas en un uso real), pero conviene resolverlo antes de un volumen alto.

---

## Verificado por código, no por interacción (los 4 bugs ya corregidos)

No tengo forma de re-probarlos en vivo, pero confirmé leyendo el código actual que los fixes siguen en el árbol:

- **Teclado tapa el input:** `scrollFieldIntoView` presente en Login/Registro y en los 3 inputs de texto del Onboarding (`Login.tsx`, `RolStep.tsx`, `StackStep.tsx`, `ModalidadStep.tsx`). ✅
- **Doble tap en Onboarding:** `isTransitioning` guardando "Continuar"/"Atrás" en `OnboardingWizard.tsx`. ✅
- **Ofertas no refrescan tras importar:** `handleImportar` llama a `refetch()` en `Offers.tsx:81`. ✅ (Nota: si el usuario tiene un filtro de Score Mínimo activo, las ofertas importadas con score bajo van a seguir sin aparecer — eso es el filtro funcionando correctamente, no el mismo bug.)
- **Barra de selección rota en mobile:** `flex-col md:flex-row` + `min-h-11` en los botones, en `Offers.tsx`. ✅

---

## Pantallas revisadas sin hallazgos nuevos

- **Login/Registro** (además de lo ya corregido): validación de email/password del navegador, ojito, medidor de fortaleza — sin problemas nuevos.
- **Onboarding** (4 pasos): sin hallazgos nuevos más allá de M-3.
- **Tablero:** drag desktop, `<select>` mobile, apertura/cierre de Ficha — la Ficha ya tiene protección contra fetches superpuestos si se cambia rápido de postulación (`cancelado` flag en el `useEffect`). Sin hallazgos.
- **Ficha de Postulación:** cambio de estado, agregar/borrar interacciones — todos los botones de acción real (Guardar, Marcar como resuelto) ya tienen guard contra doble tap. Sin hallazgos nuevos.
- **Analytics:** con 0 postulaciones/ofertas ya muestra estados vacíos explícitos por cada KPI y gráfico (no probé esto renderizado, pero el código contempla el caso explícitamente en cada bloque). Sin hallazgos.
- **Notificaciones:** no existe una pantalla de notificaciones — la campana del Topbar es decorativa (ya sabíamos esto de etapas anteriores), y los recordatorios solo se muestran como badge en el Tablero y en la Ficha. No hay nada nuevo que auditar ahí.

---

## Cierre del pase

Los 5 hallazgos con severidad importante o menor que entraron en alcance (I-1, I-2, I-3, M-1, M-2) quedaron corregidos, verificados con `npx tsc --noEmit` y `npm run test` en verde en cada tanda.

**Quedan afuera, a propósito:**
- **M-3** (duplicados de stack por mayúsculas/espacios): lo dejás para después — es cosmético y no afecta el scoring (el matching ya es case-insensitive).
- **M-4** (límite de 1000 filas de Supabase): lo dejás para después — es un trabajo de paginación, no un fix rápido, y hoy está lejos de ser un problema real con el volumen de datos actual.

Sin bloqueantes en ningún momento del pase.
