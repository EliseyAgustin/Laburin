import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, LevelFormat, TableOfContents, PageBreak, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign,
} from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Rutas relativas a este archivo: se puede correr desde cualquier carpeta (npm run docs:generar).
const AQUI = import.meta.dirname;
const RAIZ = path.resolve(AQUI, '../..');
const SHOTS = path.join(AQUI, 'capturas');
const img = (name) => fs.readFileSync(path.join(SHOTS, name));

// --- helpers ---
const h1 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 140 } });
// Título pegado a la tabla que le sigue: keepNext evita que quede suelto al pie de una página.
const h2k = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 280, after: 140 } });
const h3 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 100 } });
const p = (text, opts = {}) => new Paragraph({
  children: Array.isArray(text) ? text : [new TextRun({ text, ...opts })],
  spacing: { after: 160 },
});
const bullet = (text) => new Paragraph({
  children: [new TextRun(text)],
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
});
const code = (lines) => new Paragraph({
  shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
  border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'D0D5DD' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D0D5DD' }, left: { style: BorderStyle.SINGLE, size: 2, color: 'D0D5DD' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'D0D5DD' } },
  spacing: { before: 100, after: 220 },
  children: lines.flatMap((line, i) => i === 0
    ? [new TextRun({ text: line, font: 'Consolas', size: 19 })]
    : [new TextRun({ text: '', break: 1 }), new TextRun({ text: line, font: 'Consolas', size: 19 })]),
});

function figure(name, { width, height, caption }) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
      children: [new ImageRun({ type: 'png', data: img(name), transformation: { width, height } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: '555555' })],
    }),
  ];
}

// --- tabla de 3 columnas con anchos duales (gotcha del skill) ---
const TABLE_WIDTH = 9026; // DXA, igual a los márgenes de 1" en A4
const COL_WIDTHS = [1100, 1700, 6226];

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: '1E4FD8' },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 19 })] })],
  });
}
function bodyCell(text, width, { bold = false, color = '1A1A1A' } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, color, size: 19 })] })],
  });
}

function rfTable(rows) {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: COL_WIDTHS,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [headerCell('Req.', COL_WIDTHS[0]), headerCell('Estado', COL_WIDTHS[1]), headerCell('Nota', COL_WIDTHS[2])],
      }),
      ...rows.map(([id, estado, nota, color]) => new TableRow({
        children: [bodyCell(id, COL_WIDTHS[0], { bold: true }), bodyCell(estado, COL_WIDTHS[1], { bold: true, color: color ?? '1A1A1A' }), bodyCell(nota, COL_WIDTHS[2])],
      })),
    ],
  });
}

const VERDE = '1A7F37';
const AMBAR = 'B06A00';
const ROJO = 'C2282D';

const DESKTOP = { width: 560, height: 315 };
const DER = { width: 580, height: 341 };

const doc = new Document({
  features: { updateFields: true },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      // Portada
      new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Laburin', bold: true, size: 64, color: '1E4FD8' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 400 }, children: [new TextRun({ text: 'Memoria Técnica', size: 32, color: '333333' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1600 }, children: [new TextRun({ text: 'Plataforma Web de Búsqueda y Seguimiento Laboral Automatizada con Motor de Scoring', italics: true, size: 22, color: '666666' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Práctica Profesional Supervisada', size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Tecnicatura Universitaria en Tecnologías Web — Universidad Nacional del Oeste', size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Autor: Agustín Elisey — Docente: Viviana Esterkin', size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Segundo Cuatrimestre 2026', size: 20 })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // Indice
      new Paragraph({ text: 'Índice', heading: HeadingLevel.HEADING_1 }),
      new TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-2' }),
      new Paragraph({ children: [new PageBreak()] }),

      // 1. Resumen del proyecto
      h1('1. Resumen del proyecto'),
      h2('Problema'),
      p('Laburin parte de un antecedente funcional real: un script de Google Apps Script (jobbot-v5.gs) que el autor usaba para su propia búsqueda laboral. Ese script buscaba ofertas en 7 fuentes, las puntuaba con un motor de scoring hardcodeado y mandaba un mail diario con un link a una planilla de Google Sheets. Sus limitaciones centrales — identificadas en la etapa de relevamiento (SRS, §3.6) — eran: reglas de puntuación hardcodeadas e indeployables sin tocar código, ausencia de modelo relacional (cada corrida sobreescribía la planilla del día), y una salida puramente pasiva, sin seguimiento del ciclo de vida de una postulación después de que la oferta aparecía en el mail.'),
      h2('Objetivo'),
      p('Construir una plataforma web que reemplace ese script por un sistema con persistencia relacional real, un motor de scoring configurable desde la interfaz (sin tocar código) y, sobre todo, una capa que no existía en el antecedente: el seguimiento activo de cada postulación a lo largo de su ciclo de vida, desde que se decide aplicar hasta que el proceso termina.'),
      h2('Alcance — qué entra'),
      bullet('Motor de scoring configurable por el usuario sobre 3 criterios: stack tecnológico, modalidad y ubicación.'),
      bullet('Carga de ofertas manual y por importación desde fuentes externas.'),
      bullet('Tablero Kanban de 6 estados para seguir cada postulación, con historial de cambios de estado.'),
      bullet('Ficha de Postulación con registro de interacciones (mails, llamados, entrevistas).'),
      bullet('Recordatorios automáticos por inactividad prolongada de una postulación.'),
      bullet('Panel de Métricas con indicadores operativos de toda la búsqueda.'),
      bullet('Autenticación multiusuario real (registro, login, onboarding).'),
      h2('Alcance — qué no entra'),
      p('Reafirmado de la propuesta original (SRS, §8): bolsa de empleo pública para terceros o redes sociales profesionales, portales de publicación directa de ofertas o gestión de RRHH/contratos, y automatización de envío masivo/autónomo de currículums fuera de esta plataforma.'),
      p('Además, durante el desarrollo se redujeron deliberadamente algunos puntos que la especificación original sí contemplaba (automatización periódica completa de 7 fuentes, reglas fijas de scoring heredadas del script anterior). La Sección 9 compara, punto por punto, qué de la especificación original se cumplió y qué quedó afuera a propósito.'),

      // 2. Arquitectura
      h1('2. Arquitectura'),
      h2('Stack'),
      p('Frontend: React 19 + TypeScript, sobre Vite 6 como bundler/dev server, con Tailwind CSS v4 para estilos (tokens de tema definidos con @theme, soporte de claro/oscuro vía prefers-color-scheme con override manual por data-theme). Ruteo con React Router v7. Gráficos del Panel de Métricas con Recharts. Testing unitario con Vitest.'),
      p('Backend: Supabase (PostgreSQL gestionado + Auth + Row Level Security), sin servidor propio. Cada tabla de dominio tiene RLS activado por user_id, de forma que un usuario solo puede leer y escribir sus propias filas — esto se verificó también como parte del testing (ver Sección 6).'),
      h2('Por qué este stack'),
      bullet('Supabase reemplaza la planilla de Google Sheets del antecedente por persistencia relacional real, con autenticación y control de acceso por fila ya resueltos, sin tener que levantar y mantener un backend propio — una decisión apropiada para el alcance y el tiempo disponible de una PPS.'),
      bullet('TypeScript con tipado estricto resultó necesario por la cantidad de entidades relacionadas entre sí (ofertas, postulaciones, criterios, interacciones, recordatorios) — los errores de forma de datos entre capas se detectan en compilación, no en producción.'),
      bullet('Tailwind v4 permitió iterar visualmente rápido sin mantener una hoja de estilos paralela, lo cual importó particularmente en la etapa de pulido de usabilidad/mobile, donde se iteró mucho sobre tamaños de touch target y breakpoints.'),
      h2('Estructura de carpetas'),
      p('El proyecto organiza src/ por tipo de archivo, no por dominio/feature:'),
      code([
        'src/',
        '  components/      componentes UI reutilizables y de layout',
        '    layout/          AppLayout, Sidebar, Topbar',
        '  features/        flujos multi-paso con estado propio',
        '    onboarding/      OnboardingWizard + steps/ (Rol, Stack, Modalidad, Seniority)',
        '  pages/           una vista por ruta (Login, Offers, Tablero, Settings, Analytics, Onboarding)',
        '  hooks/           useAuth, useOnboarding, useTheme',
        '  services/        un archivo por entidad, única capa que habla con Supabase',
        '  lib/             utilidades puras (errores, utils, passwordStrength, fuentes, seleccion, lotes, tags)',
        'e2e/              suite de Playwright (fuera de src/, se corre con npm run test:e2e)',
        '  types/           interfaces TypeScript compartidas',
      ]),
      p('La capa de services/ es la única que importa el cliente de Supabase: cada entidad del dominio (ofertas, postulaciones, interacciones, criteriosScoring, scoring, recordatorios, metricas, fuentesExternas, onboarding) tiene su propio archivo, y las páginas consumen esas funciones en vez de armar queries propias. Esto fue lo que permitió, por ejemplo, verificar en el pase de testing E2E que un recálculo de scoring dentro de un service se propaga solo, sin que ningún componente de React tenga que "acordarse" de refrescar nada (ver Sección 4).'),

      // 3. Modelo de datos
      h1('3. Modelo de datos'),
      p('El esquema vive enteramente en PostgreSQL (Supabase), con RLS por user_id en cada tabla de dominio. El siguiente diagrama resume las entidades y sus relaciones reales, tal como quedaron definidas en las migraciones de supabase/migrations/.'),
      ...figure('09-der.png', { ...DER, caption: 'Diagrama entidad-relación del esquema real de Supabase.' }),
      h2('Notas del modelo'),
      bullet('perfil_usuario.dias_inactividad_recordatorio guarda el umbral de inactividad de cada usuario (entero, default 7, con un CHECK que obliga a estar entre 1 y 90). El mismo rango y el mismo default 7 se validan en el frontend, de modo que la base es la última línea de defensa y no la única (Sección 5.5).'),
      bullet('Toda tabla de dominio (perfil_usuario, criterios_scoring, ofertas, postulaciones, interacciones, recordatorios, postulacion_historial_estados) referencia a auth.users mediante user_id, con RLS activado — este patrón se adoptó desde el modelado inicial (SRS, RNF-02), antes de que se decidiera construir la funcionalidad de multi-usuario completa (ver Sección 7).'),
      bullet('postulaciones.oferta_id tiene una constraint UNIQUE: a lo sumo una Postulación por Oferta. La relación Oferta→Postulación es, en los hechos, 1 a 0..1.'),
      bullet('interacciones, recordatorios y postulacion_historial_estados derivan su user_id del dueño de la postulación mediante trigger — el cliente nunca lo decide directamente, lo cual cierra una vía de escritura cruzada entre usuarios incluso si el frontend tuviera un bug.'),
      bullet('postulacion_historial_estados se llena exclusivamente vía un trigger de base de datos (registrar_historial_estado, security definer, con RLS de solo lectura para el cliente) — cada cambio de estado queda registrado sin importar si vino del drag de desktop o del selector de mobile, porque ambos caminos terminan escribiendo la misma fila de postulaciones.'),
      bullet('recordatorios tiene un índice único parcial (recordatorios_un_activo_por_postulacion_idx) sobre postulacion_id donde estado=\'activo\' — garantiza, a nivel de base, que nunca haya dos recordatorios activos simultáneos para la misma postulación.'),

      // 4. El motor de scoring
      h1('4. El motor de scoring'),
      h2('Cómo se calcula'),
      p('El cálculo del puntaje de una oferta es, deliberadamente, muy simple: suma el peso de cada criterio activo que la oferta matchea.'),
      code([
        'export function calcularScoring(',
        '  oferta: OfertaParaScoring,',
        '  criterios: CriterioScoring[]',
        '): number {',
        '  return criterios',
        '    .filter((criterio) => criterio.activo)',
        '    .filter((criterio) => criterioMatchea(oferta, criterio))',
        '    .reduce((total, criterio) => total + criterio.peso, 0);',
        '}',
      ]),
      p('Cada criterio define un campo_objetivo de la oferta a mirar (stack_tecnologico, modalidad, ubicacion, etc.), un valor_comparacion, y un tipo_coincidencia: contiene (substring, case-insensitive), exacto (igualdad case-insensitive) o rango_numerico (entre rango_min y rango_max). criterioMatchea aplica la comparación que corresponda según el tipo.'),
      h2('Por qué configurable'),
      p('Esto responde directamente a la limitación #1 identificada en el antecedente (SRS, §3.6): en el script v5.0 todo el peso de cada señal de scoring estaba hardcodeado en un objeto CONFIG, y cambiar una keyword o un peso requería editar y redeployar el script. Exponer peso, campo_objetivo y valor_comparacion como filas editables en criterios_scoring (tabla, no código) elimina esa fricción: el usuario ajusta sus prioridades desde la UI de Configuración, sin pasar por un deploy.'),
      h2('Recálculo, no caché'),
      p('Cada vez que se crea, edita o borra un criterio, o se crea/edita una oferta, el service correspondiente llama a recalcularTodosLosScores(userId) de forma síncrona antes de que la función async termine — no es un efecto que dependa de que un componente de React lo dispare por separado. El recálculo lee las ofertas por lotes (para no toparse con el límite de 1000 filas de una sola lectura) y escribe únicamente las filas cuyo puntaje cambió, de a diez en paralelo. Esto se verificó explícitamente contra una base real durante el pase de testing E2E: subir el peso de un criterio de 15 a 25 recalculó una oferta ya cargada de 30 a 40 puntos, sin que la página de Ofertas necesitara ningún tipo de invalidación de caché — porque no existe tal caché: cada página pide los datos de nuevo al montarse.'),

      // 5. Decisiones de diseño relevantes
      h1('5. Decisiones de diseño relevantes'),
      p('Esta sección cubre únicamente decisiones que tuvieron una alternativa real evaluada y descartada — no un recuento general de todo lo construido.'),

      h2('5.1 Selector en mobile en vez de @dnd-kit'),
      p('El Tablero usa drag-and-drop nativo de HTML5 en desktop. La alternativa evaluada para que el Kanban también soportara arrastre táctil en mobile era sumar una librería dedicada (@dnd-kit u otra). Se descartó: el drag nativo de HTML5 es poco confiable sobre touch, y agregar una dependencia nueva solo para ese caso de uso no se justificaba frente a una alternativa más simple. En su lugar, cada tarjeta expone en mobile un selector "Mover a..." que llama exactamente a la misma función de cambio de estado que usa el drag de desktop — mismo camino de datos, dos interfaces de entrada. El costo aceptado es perder la sensación de arrastre en mobile; lo ganado es cero dependencias nuevas y un único punto de verdad para el cambio de estado, más simple de testear.'),

      h2('5.2 Importación manual en vez de Edge Function + cron'),
      p('La especificación original (RNF-05) pedía que la búsqueda en fuentes externas corriera en un job programado, no bajo demanda del usuario. Se descartó esa automatización dentro del tiempo de esta PPS: el foco se puso en el motor de scoring configurable y el tablero de seguimiento — el valor nuevo central del proyecto — por sobre la automatización completa del pipeline de búsqueda. La importación quedó como un botón ("Importar ofertas remotas") que el usuario dispara cuando quiere. Aparte se agregó un GitHub Action con cron cada 3 días, pero cumple un propósito distinto: solo hace un ping liviano a Supabase para evitar que el proyecto gratuito se pause por inactividad, no reemplaza la búsqueda periódica que pedía RNF-05.'),

      h2('5.3 Dos fuentes externas en vez de las siete originales'),
      p('El antecedente (v5.0) consultaba 7 fuentes, incluyendo el parseo de HTML del endpoint público de LinkedIn — identificado en la propia SRS (§3.2) como "la más frágil: no es JSON, se parsea con regex; cualquier cambio de markup la rompe". Se evaluó portar las 7 y se descartó: Remotive y Arbeitnow exponen API REST JSON pública y estable, mientras que sumar LinkedIn (parseo HTML no oficial) y las fuentes restantes (Indeed AR, GetOnBrd, Vacantes Digitales, Himalayas) hubiera sumado superficie de mantenimiento sin aportar directamente al objetivo central de la PPS. Se priorizó profundidad en scoring/tablero/ficha por sobre amplitud de fuentes.'),

      h2('5.4 Estado de borrador separado para los campos de peso'),
      p('Durante el pase de QA se encontró que el campo "Peso" de un criterio existente se "pegaba" en 0 al editarlo: Number(\'\') evalúa a 0, no a NaN, y como el input es controlado, React repintaba el campo con "0" antes de que el usuario terminara de borrarlo para escribir un valor nuevo. La alternativa evaluada fue un parche puntual (tratar value==\'\' como caso especial dentro del mismo estado numérico). Se descartó por no atacar la causa real: mezclar en un solo estado "lo que se está escribiendo" con "lo que está persistido" es estructuralmente proclive a este tipo de bug. La solución adoptada fue separar ambas cosas explícitamente — un estado de borradores en string (pesoDrafts), independiente del valor numérico guardado, que solo se parsea y persiste al perder el foco del campo. El mismo patrón se reutilizó después para el campo "Umbral de Inactividad" (Sección 5.5).'),

      h2('5.5 Umbral de inactividad: una columna por usuario, con efecto solo hacia adelante'),
      p('El umbral que dispara un recordatorio (RF-14) vivía hardcodeado en el motor y el campo de Configuración no hacía nada. Para persistirlo por usuario se evaluó crear una tabla de preferencias aparte y se descartó: es un único valor por cuenta, y perfil_usuario ya tiene RLS por user_id y el trigger de updated_at. Se agregó una columna dias_inactividad_recordatorio (entero, default 7, CHECK entre 1 y 90). El default de la base, el del motor y el que muestra la pantalla salen de la misma constante, para que no vuelva a pasar que la interfaz diga 30 y el motor use 7.'),
      p('Qué pasa con los recordatorios ya generados cuando el usuario cambia el umbral: el cambio solo aplica hacia adelante. Los recordatorios activos no se tocan ni se recalculan hacia atrás, porque la persona puede haberlos visto y borrarlos sería sorprendente. Si baja el umbral, las postulaciones que ya superan el nuevo valor generan su recordatorio en la próxima carga; si lo sube, los activos quedan hasta que se resuelvan y no se generan otros nuevos hasta cumplir el nuevo plazo. La decisión de "está inactiva" es una función pura (estaInactiva, exige estrictamente más de N días), cubierta con tests unitarios en los bordes (exactamente N días, N-1, umbral 1 y umbral 90) y con un test E2E de la política.'),

      h2('5.6 Paginación en el servidor en vez de traer todo y filtrar en memoria'),
      p('El listado de Ofertas traía todas las filas y filtraba en el navegador; como Supabase corta cada lectura en 1000 filas, pasado ese volumen se perdían ofertas sin ningún aviso. La alternativa más barata era seguir trayendo todo, por lotes, y filtrar en memoria; se descartó porque con miles de ofertas cargaría y mantendría todo en el cliente para mostrar treinta tarjetas. Se resolvió con paginación en el servidor (range() con conteo exacto) y los tres filtros (fuente, ubicación, score mínimo) aplicados en la propia consulta.'),
      p('El borrado masivo se rediseñó para que haga exactamente lo que dice. La casilla de la cabecera selecciona la página visible y lo aclara en su texto; cuando hay más coincidencias que las visibles aparece un enlace "Seleccionar las N ofertas que coinciden con los filtros", que trae solo los ids por lotes. "Eliminar seleccionadas (N)" borra siempre esos N. La deduplicación del import dejó de depender de tener las ofertas cargadas: consulta, por lotes y solo con las columnas necesarias, las claves ya guardadas de las fuentes que se importan. Las demás lecturas "de todo" (Analytics, Tablero, recordatorios, historial) leen por lotes con un helper común (leerEnLotes) con orden estable.'),

      // 6. Testing
      h1('6. Testing'),
      h2('Metodología'),
      p('Las funciones puras del dominio (motor de scoring, criterios, recordatorios, métricas, utilidades) se desarrollaron bajo TDD con Vitest: test en rojo antes de la implementación, luego verde. Todo lo que es integración UI–backend se verificó, a falta de navegador disponible durante gran parte del desarrollo, mediante una combinación de lectura de código y verificación directa contra una instancia real de Supabase — nunca contra mocks. En el pase final se sumó una suite de Playwright con un navegador real (Chromium), separada de Vitest: npm run test corre solo los tests unitarios y npm run test:e2e corre la suite de punta a punta.'),
      h2('Pase de QA'),
      p('Auditoría sistemática de toda la app por lectura de código, clasificada en bloqueante / importante / menor. No se encontraron bloqueantes. Se corrigieron 3 hallazgos importantes — el campo de peso "pegado" en 0 al editar un criterio existente, ausencia de límites mínimo/máximo en los campos de peso (un peso negativo restaba puntos de forma silenciosa), y el botón "Cancelar" del modal de oferta que no bloqueaba un guardado ya en curso — y 2 menores: ausencia de maxLength en todos los campos de texto, y falta de feedback visual durante la verificación inicial de sesión. Dos hallazgos menores quedaron en ese momento fuera de alcance a pedido explícito — duplicados casi-idénticos de tags de stack por mayúsculas o espacios, y el límite de 1000 filas por defecto de Supabase sin paginar — y se resolvieron en el pase final (Secciones 5.6 y 6, Pase con Playwright).'),
      h2('Pase E2E'),
      p('Seis flujos de punta a punta (alta de usuario, ciclo de vida completo de una oferta, importación con scoring y filtros, configuración afectando el scoring en vivo, recordatorios por inactividad, sesión y navegación) verificados con dos fuentes de evidencia combinadas: un script temporal contra la instancia real de Supabase de producción (con autorización explícita), que ejecutó 33 verificaciones concretas contra las mismas tablas, triggers y RLS que usa la aplicación — las 33 en verde — y trazado de código para la parte puramente de React (qué se re-renderiza y qué se vuelve a pedir al navegar entre pantallas). No se encontraron hallazgos nuevos. El reporte documenta explícitamente lo que esta metodología no puede cubrir — la sensación real del drag-and-drop, el timing exacto de un click, el comportamiento de una sesión abierta muchas horas — como zonas ciegas honestas, no como bugs descartados. El pase con Playwright, descrito a continuación, cerró varias de ellas.'),
      h2('Pase con Playwright'),
      p('Una suite de Playwright con Chromium real, contra la aplicación levantada con Vite y la base real de Supabase, en dos proyectos: desktop (1280x800) y mobile (375x812, con touch). Corre con un solo worker porque comparte base y una cuenta por proyecto. Las cuentas de prueba se crean por el propio flujo de registro de la aplicación, las credenciales viven en un archivo de entorno que no se versiona, y la siembra y la limpieza de datos se hacen con el cliente de Supabase autenticado como el usuario de prueba — es decir, respetando RLS, sin ninguna service role key. Al terminar, un teardown borra todos los datos de las cuentas de prueba.'),
      p('Cubre: alta de usuario completa (registro, onboarding de 4 pasos con doble tap en "Continuar" en mobile, tablero vacío, criterios reflejados en Configuración); el ciclo de vida de una oferta (crear, ver el score, postular, moverla por las 6 columnas con drag-and-drop real en desktop y con el selector "Mover a..." en mobile, Ficha con interacciones, persistencia tras recargar); importación, filtros combinados y borrado masivo (también con la barra de selección en mobile); el efecto de un cambio de peso y de un criterio nuevo sobre el score; el umbral de inactividad (persistencia, validación y momento en que aparece el recordatorio); más de 1000 ofertas (paginación completa, filtros más allá de la fila 1000, contador, selección de las N que coinciden, deduplicación del import, Analytics y recálculo de scores); Mi cuenta (nombre, tema, contraseña); y sesión (cerrar, reingresar, rutas protegidas sin sesión). La suite define 34 tests: 16 por proyecto (32 en total) más una sesión de preparación por proyecto, que deja guardada la sesión de la cuenta compartida (2). En desktop, el test del teclado virtual solo aplica a mobile y se saltea de forma explícita, de modo que la corrida final completa ejecutó 33 tests (31 de punta a punta más las 2 sesiones de preparación), todos en verde, y 1 salteado. La lógica pura está cubierta aparte por 160 tests unitarios de Vitest.'),
      p('Hallazgos reales que encontró y que se corrigieron, cada uno con su test: (1) una carrera en el Tablero — una lectura inicial tardía pisaba el primer movimiento y devolvía la tarjeta a su columna aunque la base ya la había guardado; se corrigió descartando la respuesta de una corrida cancelada y se cubrió con un test que reproduce la respuesta vieja de forma determinista (falla sin el arreglo, pasa con él); (2) controles sin nombre accesible — pesos, botones de borrar y agregar de Configuración, filtros de Ofertas, el estado de la Ficha, los botones de cerrar — y modales sin role="dialog"; (3) el resumen de la importación decía "1 ofertas nuevas importadas". Además, una de las fallas intermitentes resultó ser un error de sincronización del propio test y se corrigió ahí, sin tocar la aplicación.'),
      p('Zonas ciegas del pase anterior que se cerraron: la sensación real del drag-and-drop en desktop (incluido el recorrido por las 6 columnas) y el timing de los clicks, ahora con un navegador real; el doble tap en el Onboarding; el selector "Mover a..." y la barra de selección en una pantalla de 375 px. Zonas ciegas que siguen abiertas: el teclado virtual real (solo se simula su efecto reduciendo el viewport; no se puede automatizar con fiabilidad); el comportamiento en un celular real y en otros motores (solo se probó Chromium, no WebKit/Safari ni hardware real); el autoscroll del navegador al arrastrar una tarjeta cerca del borde (el test desplaza el tablero antes de arrastrar); y la disponibilidad de Remotive y Arbeitnow (el import usa respuestas simuladas, con un único test de humo contra los servicios reales).'),
      h2('Bugs de producción'),
      p('Aparte de los dos pases anteriores, el uso real en dispositivos móviles encontró y corrigió 4 bugs puntuales: el teclado virtual tapando el campo enfocado, un doble tap en el Onboarding que dejaba dos pantallas superpuestas, la lista de Ofertas sin refrescar tras importar, y un problema de layout responsivo en la barra de selección múltiple de Ofertas.'),

      // 7. Trabajo fuera del alcance original
      h1('7. Trabajo fuera del alcance original'),
      p('Cosas construidas durante el desarrollo que no estaban en la especificación original, o que la contradicen explícitamente:'),
      bullet('Multi-usuario funcional completo: la SRS (§7.3, RNF-02) preveía dejar el modelo de datos preparado para multi-usuario, pero explícitamente no construir pantallas de registro público ni onboarding genérico durante esta PPS — el sistema se evaluaría con el perfil único del autor. En la práctica se construyó el flujo completo de registro, login y onboarding de 4 pasos, y el proyecto se evalúa como multi-usuario real.'),
      bullet('Pase de usabilidad y mobile completo: sidebar responsivo con drawer, el selector como fallback del Kanban en mobile (Sección 5.1), ajuste de touch targets a 44px, y visibilidad de botones hover-only en pantallas táctiles. No estaba contemplado en los requerimientos funcionales originales.'),
      bullet('Identidad visual: medidor de fortaleza de contraseña, mostrar/ocultar contraseña, fondo ambient con formas difuminadas (más marcado en Login/Registro, atenuado en el resto de la app) y tema claro/oscuro. Trabajo de pulido visual no pedido por la SRS.'),
      bullet('postulacion_historial_estados: tabla y trigger adicionales para registrar automáticamente cada cambio de estado de una postulación, no pedidos explícitamente en la SRS — se agregaron para sostener con datos reales el Panel de Métricas (tiempo promedio por etapa).'),
      bullet('Tres pases de verificación completos (QA, E2E contra la base real y una suite de Playwright con navegador real, desktop y mobile), además de los tests unitarios — un nivel de rigor de verificación no exigido explícitamente por la especificación funcional.'),
      bullet('Paginación en servidor del listado de Ofertas y lecturas por lotes en todo el sistema, para que la aplicación siga correcta pasado el límite de 1000 filas por lectura de Supabase (Sección 5.6).'),

      // 8. Limitaciones conocidas y trabajo futuro
      h1('8. Limitaciones conocidas y trabajo futuro'),
      bullet('Recálculo de scores lento con volúmenes grandes: cambiar un peso con más de 1000 ofertas actualiza cientos de filas, de a diez en paralelo, y en las pruebas con 1100 ofertas tardó entre 25 segundos y 1,2 minutos según la corrida (más de un minuto en la medición más lenta). Es correcto pero no instantáneo. Mejora posible: una función SQL que recalcule todos los puntajes en una sola sentencia, sin una escritura por fila.'),
      bullet('Importar ofertas inserta una por una (cada alta lee la sesión y los criterios): con muchas ofertas nuevas es lento. Un insert por lotes lo mejoraría.'),
      bullet('Sin pruebas en un celular real ni en otros motores, y sin automatizar el teclado virtual real: la suite de Playwright usa Chromium emulado y solo simula el efecto del teclado (Sección 6).'),
      bullet('Solo 2 de las 7 fuentes originales, sin automatización periódica: la búsqueda de ofertas externas depende de que el usuario toque "Importar" — no hay job de fondo (Sección 5.2 y 5.3).'),
      bullet('Sin notificación por email: los recordatorios solo viven dentro de la aplicación (badge en Tablero y Ficha), no hay el mail de resumen diario que tenía el antecedente.'),
      bullet('El motor de scoring no portó las reglas fijas heredadas del script anterior (recencia, seniority, exclusiones por keyword, idioma, salario): el puntaje depende exclusivamente de los criterios que el usuario configure. Si el usuario no configura ningún criterio, no hay ninguna señal de calidad de base.'),
      bullet('Sin categorización de rol (QA / Data Entry / Admin / Data Analyst, u otra taxonomía): no hay forma de filtrar o tagear ofertas por categoría de puesto más allá de los criterios de texto libre que arme el propio usuario.'),

      // 9. Conclusiones
      h1('9. Conclusiones'),
      p('Esta sección compara, punto por punto, lo entregado contra la especificación de requerimientos (SRS) original. El objetivo general del proyecto — una plataforma con motor de scoring configurable y seguimiento activo de postulaciones, reemplazando el script y la planilla del antecedente — se cumplió. Lo que sí varió respecto del documento inicial fue el reparto interno de esfuerzo: se priorizó profundidad en scoring, tablero, ficha de postulación y calidad vía testing, por sobre completitud de automatización (fuentes externas, ejecución periódica, notificaciones por email).'),
      h2k('Requerimientos funcionales'),
      rfTable([
        ['RF-01', 'Parcial', 'Solo 2 de las 7 fuentes (Remotive, Arbeitnow); importación manual, no automatizada ni periódica.', AMBAR],
        ['RF-02', 'Cumplido', 'Aislamiento por fuente (try/catch), aplicado a las 2 fuentes implementadas.', VERDE],
        ['RF-03', 'No implementado', 'Sin categorización QA/Data Entry/Admin/Data Analyst — descartado a propósito en favor del scoring configurable como discriminador principal.', ROJO],
        ['RF-04', 'Parcial', 'Deduplicación por empresa+rol+fuente sí implementada; vencimiento a 72hs no implementado.', AMBAR],
        ['RF-05', 'Parcial', 'El score surge solo de los 3 criterios configurables; las reglas fijas heredadas (recencia, seniority, exclusiones, idioma, salario) no se portaron al motor.', AMBAR],
        ['RF-06', 'Cumplido', 'Alta manual e importación conviven como vías complementarias.', VERDE],
        ['RF-07', 'Cumplido', 'Listado filtrable por fuente, ubicación y score mínimo.', VERDE],
        ['RF-08', 'Cumplido', '"Postularme" crea la Postulación en estado por_aplicar.', VERDE],
        ['RF-09', 'Cumplido', 'Tablero de 6 columnas de estado.', VERDE],
        ['RF-10', 'Cumplido (ampliado)', 'Drag nativo en desktop, más un selector como fallback en mobile no pedido originalmente (Sección 5.1).', VERDE],
        ['RF-11', 'Cumplido', 'Ficha con historial de interacciones por fecha y tipo.', VERDE],
        ['RF-12', 'Cumplido', 'Los 3 criterios (stack, modalidad, ubicación) son editables sin tocar código.', VERDE],
        ['RF-13', 'Cumplido, con matiz', 'Las reglas fijas no se exponen en la UI, pero tampoco llegaron a implementarse en el motor — no es que estén ocultas, es que no existen (ver RF-05).', AMBAR],
        ['RF-14', 'Cumplido', 'El umbral de inactividad se configura por usuario (de 1 a 90 días, 7 por defecto), se guarda en la base y es el que usa el motor de recordatorios. El cambio aplica hacia adelante (Sección 5.5).', VERDE],
        ['RF-15', 'Cumplido', 'Se generan recordatorios, con el umbral configurable de cada usuario, cuando una postulación queda sin novedades.', VERDE],
        ['RF-16', 'No implementado', 'Sin notificación por email.', ROJO],
        ['RF-17', 'Cumplido', 'Panel de Métricas con indicadores operativos reales.', VERDE],
      ]),
      h2k('Requerimientos no funcionales'),
      rfTable([
        ['RNF-01', 'Cumplido', 'Aislamiento por fuente, aplicado a las 2 fuentes reales implementadas.', VERDE],
        ['RNF-02', 'Ampliado', 'Se construyó multi-usuario funcional completo (registro, login, onboarding), más allá de lo que la propia SRS preveía para esta PPS (§7.3 decía explícitamente que no se construiría).', VERDE],
        ['RNF-03', 'Cumplido', 'Autenticación vía Supabase Auth.', VERDE],
        ['RNF-04', 'Cumplido', 'Persistencia relacional en Postgres, con relación real Oferta↔Postulación (UNIQUE).', VERDE],
        ['RNF-05', 'No cumplido', 'Sin cron ni Edge Function de búsqueda; la importación es manual. El GitHub Action existente es solo un keepalive de Supabase (Sección 5.2), no cumple la función de búsqueda periódica.', ROJO],
      ]),
      // Un respiro entre la última tabla y la síntesis (antes el párrafo quedaba pegado a la tabla).
      new Paragraph({ spacing: { before: 280, after: 160 }, children: [new TextRun('En síntesis: de los 17 RF originales, 12 se cumplieron (10 tal como fueron especificados, 1 ampliado — RF-10 — y 1 cumplido con matices — RF-13), 3 se cumplieron parcialmente (RF-01, RF-04, RF-05) y 2 no se implementaron (RF-03, RF-16). De los 5 RNF, 3 se cumplieron, 1 se amplió deliberadamente por sobre lo previsto (RNF-02) y 1 no se cumplió (RNF-05). Ninguno de los recortes fue accidental: cada uno queda documentado con su alternativa descartada en la Sección 5 o como limitación conocida en la Sección 8, en vez de quedar implícito.')] }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(RAIZ, 'Laburin-Memoria-Tecnica.docx'), buf);
  console.log('Generado: Laburin-Memoria-Tecnica.docx', buf.length, 'bytes');
});
