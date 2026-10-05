import { expect, test } from './fixtures';
import { esMobile } from './ui';

// H-1: mover una tarjeta mientras todavía llegaba una respuesta tardía del refetch inicial la devolvía a su
// columna anterior aunque la base ya hubiera guardado el cambio. En desarrollo el efecto de montaje corre dos veces
// (StrictMode), así que hay dos lecturas: acá la segunda se entrega con retraso (con los datos de antes del movimiento) para reproducir esa carrera de forma determinista.
test('mover una tarjeta justo después de cargar no se revierte cuando llega una lectura tardía', async ({ page, api }, testInfo) => {
  await api.sembrarOfertas([{ empresa: 'Acme', rol: 'Carrera Dev', stack_tecnologico: ['React'], puntaje_scoring: 25 }]);
  const { data } = await api.sb.from('ofertas').select('id').single();
  await api.crearPostulacionDe(data!.id);

  let lecturas = 0;
  await page.route(/\/rest\/v1\/postulaciones\?select=\*%2Coferta/, async (route) => {
    lecturas++;
    if (lecturas === 1) return route.continue();
    // La respuesta se pide ya (datos de ese instante) pero se entrega tarde: llega "vieja" después del movimiento.
    const respuesta = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.fulfill({ response: respuesta });
  });

  await page.goto('/tablero');
  const tarjeta = page.getByRole('heading', { name: 'Carrera Dev', level: 4 });
  await expect(tarjeta).toBeVisible();

  const encabezado = page
    .locator('div')
    .filter({ has: page.getByRole('heading', { name: 'Aplicado', level: 3, exact: true }) })
    .last();

  if (esMobile(testInfo)) {
    await page.getByLabel('Mover "Carrera Dev" a otro estado').selectOption({ label: 'Aplicado' });
  } else {
    await tarjeta.dragTo(encabezado);
  }
  await expect(encabezado).toContainText('1');

  // Deja pasar la lectura demorada y confirma que el movimiento sigue en pie, en pantalla y en la base.
  await page.waitForTimeout(2500);
  await expect(encabezado).toContainText('1');
  const { data: fila } = await api.sb.from('postulaciones').select('estado').single();
  expect(fila?.estado).toBe('aplicado');
});
