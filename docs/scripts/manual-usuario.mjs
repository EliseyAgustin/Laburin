import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, LevelFormat, TableOfContents, PageBreak, BorderStyle, convertInchesToTwip
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
const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts })],
  spacing: { after: 160 },
});
const bullet = (text) => new Paragraph({
  children: [new TextRun(text)],
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
});
const numberedStep = (text) => new Paragraph({
  children: [new TextRun(text)],
  numbering: { reference: 'pasos', level: 0 },
  spacing: { after: 80 },
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

const DESKTOP = { width: 600, height: 337 };
const TALL = { width: 580, height: 408 }; // registro / onboarding (1280x900)
const MOBILE = { width: 230, height: 496 };

const doc = new Document({
  features: { updateFields: true },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: 'pasos',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      // Portada
      new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Laburin', bold: true, size: 72, color: '1E4FD8' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 2000 }, children: [new TextRun({ text: 'Manual de Usuario', size: 36, color: '333333' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Organizá tu búsqueda laboral en un solo lugar', italics: true, size: 24, color: '666666' })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // Indice
      new Paragraph({ text: 'Índice', heading: HeadingLevel.HEADING_1 }),
      new TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-2' }),
      new Paragraph({ children: [new PageBreak()] }),

      // 1. Qué es Laburin
      h1('1. Qué es Laburin'),
      p('Laburin es una aplicación web pensada para organizar tu búsqueda laboral en un solo lugar. En vez de tener las ofertas que te interesan dispersas en pestañas del navegador, planillas sueltas o notas, Laburin te permite guardar cada oferta, hacerle seguimiento a tu postulación paso a paso, y calcular automáticamente qué tan bien encaja cada oferta con lo que buscás.'),
      p('Con Laburin podés:'),
      bullet('Guardar ofertas de trabajo que encontraste vos, o importar automáticamente ofertas publicadas en portales de empleo remoto.'),
      bullet('Ver de un vistazo qué tan afín es cada oferta a tu perfil, gracias a un puntaje de afinidad que vos mismo podés ajustar.'),
      bullet('Seguir el estado de cada postulación en un tablero visual, desde "Por aplicar" hasta "Oferta recibida" o "Rechazado".'),
      bullet('Registrar cada contacto con la empresa (mails, llamados, entrevistas) para no perder el hilo.'),
      bullet('Recibir un aviso cuando una postulación lleva mucho tiempo sin novedades.'),
      bullet('Ver estadísticas de toda tu búsqueda: cuántas postulaciones activas tenés, cómo avanzan, y cuáles son tus mejores fuentes de ofertas.'),

      // 2. Registro e inicio de sesión
      h1('2. Registro e inicio de sesión'),
      p('Para usar Laburin necesitás una cuenta. Podés crear una con tu email y una contraseña.'),
      h2('Crear una cuenta'),
      p('En la pantalla de inicio, hacé clic en "¿No tenés cuenta? Registrate". Completá tu email y elegí una contraseña.'),
      p('Mientras escribís la contraseña, vas a ver un indicador que te muestra qué tan segura es (débil, media o fuerte). Usar una contraseña fuerte, con mayúsculas, números y algún símbolo, ayuda a proteger tu cuenta.'),
      p('Podés tocar el ícono del ojo, al lado del campo de contraseña, para mostrarla u ocultarla mientras la escribís y así confirmar que no te equivocaste.'),
      ...figure('02-registro.png', { ...TALL, caption: 'Pantalla de registro, con el indicador de fortaleza de la contraseña.' }),
      h2('Iniciar sesión'),
      p('Si ya tenés cuenta, ingresá tu email y contraseña en la pantalla de inicio y hacé clic en "Ingresar". Laburin va a recordar tu sesión, así que no vas a tener que volver a loguearte cada vez que abras la aplicación en el mismo dispositivo.'),

      // 3. Onboarding
      h1('3. Onboarding'),
      p('La primera vez que entrás a Laburin, antes de ver tus ofertas, te vamos a hacer algunas preguntas rápidas sobre tu búsqueda. Esto sirve para calcular, desde el primer momento, qué tan afín es cada oferta a lo que estás buscando.'),
      p('El onboarding tiene varios pasos cortos:'),
      numberedStep('Rol buscado: qué puesto estás buscando (por ejemplo, "QA Automation" o "Frontend Developer").'),
      numberedStep('Tecnologías: qué tecnologías te interesan o manejás.'),
      numberedStep('Modalidad y ubicación: remoto, híbrido o presencial, y en qué ciudad buscás.'),
      numberedStep('Nivel de experiencia: junior, semi senior o senior.'),
      ...figure('03a-onboarding-rol.png', { ...TALL, caption: 'Primer paso del onboarding: el rol que estás buscando.' }),
      ...figure('03b-onboarding-stack.png', { ...TALL, caption: 'Selección de tecnologías de interés, con opción de agregar otras.' }),
      p('Cada respuesta que des acá se convierte, automáticamente, en un criterio de afinidad: Laburin le va a sumar puntos a las ofertas que mencionen tu rol, tus tecnologías, tu modalidad preferida, etc. No te preocupes si no queda exactamente como buscás — más adelante, en Configuración, vas a poder ajustar, agregar o quitar estos criterios cuando quieras.'),
      p('Si no querés completar el onboarding en este momento, podés tocar "Omitir por ahora" en cualquier paso. Vas a poder cargar esta información más adelante desde Configuración.'),

      // 4. Ofertas
      h1('4. Ofertas'),
      p('La sección "Ofertas" es donde ves todas las ofertas de trabajo que guardaste, con su puntaje de afinidad calculado automáticamente.'),
      ...figure('04a-ofertas.png', { ...DESKTOP, caption: 'Listado de ofertas, con el puntaje de afinidad de cada una.' }),
      h2('Ver y filtrar ofertas'),
      p('Cada oferta se muestra en una tarjeta con la empresa, el puesto, la modalidad, las tecnologías mencionadas y, en un círculo de color, el puntaje de afinidad: cuanto más alto, mejor encaja con tu perfil.'),
      p('Arriba de la lista podés filtrar por fuente (de dónde salió la oferta), por ubicación, y por puntaje mínimo, para encontrar rápido las que más te interesan. Los filtros se aplican sobre todas tus ofertas, no solo sobre las que ves en pantalla.'),
      h2('Moverte entre páginas'),
      p('Las ofertas se muestran de a 30 por página. Al final de la lista vas a ver cuántas ofertas tenés en total (con los filtros que estés usando) y en qué página estás, por ejemplo "34 ofertas · Página 1 de 2", junto con los botones "Anterior" y "Siguiente" para pasar de una página a otra.'),
      ...figure('04c-ofertas-paginacion.png', { ...DESKTOP, caption: 'Al final del listado: el total de ofertas, la página actual y los botones para cambiar de página.' }),
      h2('Importar ofertas automáticamente'),
      p('Tocando "Importar ofertas remotas", Laburin busca ofertas nuevas publicadas en portales de empleo remoto y las agrega a tu lista, calculando el puntaje de cada una según tus criterios. Si una oferta ya la tenías cargada, Laburin no la duplica: te va a avisar cuántas se importaron y cuántas se omitieron por estar repetidas.'),
      ...figure('04b-ofertas-import.png', { ...DESKTOP, caption: 'Resultado de una importación: cuántas ofertas nuevas entraron y cuántas se omitieron por duplicadas.' }),
      h2('Cargar una oferta manualmente'),
      p('Si encontraste una oferta por tu cuenta (en LinkedIn, en la web de una empresa, por referencia de alguien), podés cargarla vos mismo con "Nueva oferta", completando empresa, puesto, modalidad, ubicación y tecnologías.'),
      h2('Editar o borrar una oferta'),
      p('Desde la tarjeta de cada oferta podés editarla (ícono de lápiz) o borrarla (ícono de tacho) individualmente.'),
      p('Si querés borrar varias a la vez, marcá las casillas de las ofertas que querés eliminar y usá "Eliminar seleccionadas" en la barra que aparece arriba de la lista. La casilla "Seleccionar esta página" marca las ofertas que estás viendo; si tenés más de una página, aparece además el enlace "Seleccionar las N ofertas que coinciden", que marca todas las que cumplen los filtros que estás usando, estén en la página que estén. El botón "Eliminar seleccionadas" siempre te dice cuántas vas a borrar, y antes de hacerlo Laburin te pide confirmación.'),
      h2('Postularte'),
      p('Cuando encontrás una oferta a la que querés postularte, tocá "Postularme". Esto la va a mover al Tablero, en la columna "Por aplicar", para que empieces a hacerle seguimiento.'),

      // 5. Tablero Kanban
      h1('5. Tablero Kanban'),
      p('El Tablero es donde seguís el estado de cada postulación, desde que decidís postularte hasta que termina el proceso.'),
      ...figure('05-tablero.png', { ...DESKTOP, caption: 'Tablero Kanban en computadora, con las seis columnas del proceso.' }),
      p('Tiene seis columnas: Por aplicar, Aplicado, En proceso, Entrevista, Oferta y Rechazado. Cada postulación es una tarjeta que vas moviendo de columna a medida que avanza el proceso.'),
      h2('En computadora'),
      p('Podés arrastrar la tarjeta de una columna a otra con el mouse: hacé clic, mantené presionado y soltá en la columna que corresponda.'),
      h2('En el celular'),
      p('Como arrastrar con el dedo en una pantalla chica puede ser poco preciso, en el celular cada tarjeta tiene un selector "Mover a...": tocás la tarjeta, elegís la columna de destino en la lista, y listo.'),
      ...figure('05b-tablero-mobile.png', { ...MOBILE, caption: 'En el celular, un selector reemplaza al arrastre para cambiar de columna.' }),
      p('Laburin guarda el historial de cada cambio de estado, así que siempre queda registro de cuándo pasó cada postulación de una etapa a otra.'),

      // 6. Ficha de Postulación
      h1('6. Ficha de Postulación'),
      p('Si tocás una tarjeta del Tablero, se abre la Ficha de esa postulación, con todos los detalles de la oferta y una línea de tiempo con cada contacto que tuviste con la empresa.'),
      ...figure('06-ficha.png', { ...DESKTOP, caption: 'Ficha de una postulación, con el timeline de interacciones registradas.' }),
      h2('Agregar una interacción'),
      p('Cada vez que tengas novedades (te mandaron un mail, te llamaron, tuviste una entrevista), podés registrarlo como una interacción: elegís el tipo, la fecha, y podés agregar una nota con el detalle.'),
      p('Esto te sirve para no perder el hilo de en qué quedó cada proceso, sobre todo cuando tenés varias postulaciones activas al mismo tiempo.'),
      h2('Borrar una interacción'),
      p('Si cargaste una interacción por error, podés borrarla desde la misma línea de tiempo.'),

      // 7. Configuración del motor de scoring
      h1('7. Configuración del motor de scoring'),
      p('En "Configuración" definís las reglas que Laburin usa para calcular el puntaje de afinidad de cada oferta.'),
      ...figure('07-configuracion.png', { ...DESKTOP, caption: 'Pantalla de Configuración, con los criterios de afinidad y su peso.' }),
      h2('Qué es un criterio'),
      p('Un criterio es una regla simple: "si la oferta menciona tal cosa, sumale tantos puntos". Por ejemplo: "si el stack tecnológico incluye React, sumar 15 puntos", o "si la modalidad es remoto, sumar 10 puntos".'),
      h2('Peso'),
      p('El "peso" es la cantidad de puntos que suma ese criterio cuando se cumple. Los criterios con más peso tienen más influencia en el puntaje final: usalo para priorizar lo que más te importa. Por ejemplo, si trabajar en modalidad remoto es innegociable para vos, dale más peso que a una tecnología secundaria.'),
      h2('Agregar un nuevo criterio'),
      p('Tocá "Agregar criterio", elegí qué campo de la oferta mirar (tecnologías, modalidad, ubicación, rol, etc.), qué valor buscar, y cuántos puntos sumar si se cumple. También podés desactivar un criterio sin borrarlo, si por ahora no lo querés tener en cuenta.'),
      h2('Umbral de inactividad'),
      p('Arriba de los criterios, en la tarjeta "Umbral de Inactividad", elegís después de cuántos días sin novedades querés que Laburin te avise sobre una postulación. Por defecto son 7 días, y podés poner cualquier número entero entre 1 y 90.'),
      p('Escribí el número y salí del campo (o apretá Enter): el valor se guarda solo y se mantiene aunque cierres la sesión. Si ponés un valor que no corresponde, por ejemplo 0 o 100, Laburin te avisa y vuelve al último valor válido.'),
      p('El cambio vale hacia adelante: los avisos que ya tenías no desaparecen ni se recalculan. Si bajás el umbral, las postulaciones que ya llevan más días que el nuevo valor van a mostrar su aviso la próxima vez que abras el Tablero; si lo subís, los avisos que ya estaban siguen hasta que los resuelvas.'),
      h2('Qué pasa con las ofertas que ya tenías cargadas'),
      p('Cada vez que agregás, editás, desactivás o borrás un criterio, Laburin recalcula automáticamente el puntaje de todas las ofertas que ya tenías guardadas: no hace falta que hagas nada más. Si entrás a Ofertas después de cambiar un criterio, vas a ver los puntajes actualizados al instante.'),

      // 8. Mi cuenta
      h1('8. Mi cuenta'),
      p('Además de la configuración del motor de scoring, tenés una sección aparte para los datos de tu propia cuenta: tu nombre, tu contraseña y el tema de la aplicación.'),
      p('Para acceder, tocá "Mi cuenta" en el menú lateral, arriba de "Cerrar Sesión".'),
      ...figure('10-mi-cuenta.png', { ...DESKTOP, caption: 'Ventana de "Mi cuenta": nombre, email, cambio de contraseña y tema.' }),
      p('Ahí podés:'),
      bullet('Cambiar tu nombre para mostrar (se usa junto con tus iniciales, que aparecen como tu avatar).'),
      bullet('Ver el email con el que te registraste (no se puede editar desde acá).'),
      bullet('Cambiar tu contraseña, con el mismo indicador de fortaleza que viste al registrarte.'),
      bullet('Elegir el tema claro u oscuro de toda la aplicación.'),

      // 9. Recordatorios por inactividad
      h1('9. Recordatorios por inactividad'),
      p('Cuando una postulación lleva varios días sin ninguna novedad, sin que hayas registrado una interacción ni cambiado su estado, Laburin te lo marca con un recordatorio, para que no se te pase hacer un seguimiento.'),
      p('Vos elegís después de cuántos días se avisa: es el "Umbral de Inactividad" que ajustás en Configuración (por defecto, 7 días; ver la sección 7). Si lo cambiás, el nuevo plazo se aplica de ahí en adelante y los avisos que ya tenías no se modifican.'),
      p('Vas a ver este aviso directamente en el Tablero, en la tarjeta de la postulación correspondiente (como se puede ver en la imagen de la sección sobre el Tablero). Alcanza con registrar una interacción nueva o mover la tarjeta de estado para que el recordatorio se resuelva solo.'),

      // 10. Panel de Métricas
      h1('10. Panel de Métricas'),
      p('La sección "Analytics" te muestra un resumen de toda tu búsqueda laboral: cuántas postulaciones tenés activas, cómo se reparten entre las distintas etapas del proceso, cuál es tu puntaje de afinidad promedio, y qué fuentes te están trayendo mejores ofertas.'),
      ...figure('08-analytics.png', { ...DESKTOP, caption: 'Panel de Métricas, con el resumen general de la búsqueda.' }),
      p('Te sirve para tomar una foto rápida de cómo viene tu búsqueda en general, sin tener que repasar oferta por oferta.'),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(RAIZ, 'Laburin-Manual-de-Usuario.docx'), buf);
  console.log('Generado: Laburin-Manual-de-Usuario.docx', buf.length, 'bytes');
});
