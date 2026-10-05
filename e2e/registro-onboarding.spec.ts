import { expect, test } from '@playwright/test';
import { conApiDe, esMobile, irA, registrarPorUI } from './ui';

// Cuenta nueva, sin la sesión guardada de la cuenta compartida.
test.use({ storageState: { cookies: [], origins: [] } });

const ESTADOS = ['Por aplicar', 'Aplicado', 'En proceso', 'Entrevista', 'Oferta', 'Rechazado'];

test('alta de usuario: registro, onboarding de 4 pasos y tablero vacío', async ({ page }, testInfo) => {
  const cuenta = await registrarPorUI(page);

  await expect(page.getByText('Paso 1 de 4')).toBeVisible();
  await page.getByPlaceholder('Ej: Frontend Developer').fill('QA Automation Engineer');

  // En mobile un segundo tap rápido en "Continuar" no debe saltear ni superponer pasos.
  const continuar = page.getByRole('button', { name: 'Continuar' });
  if (esMobile(testInfo)) await continuar.dblclick();
  else await continuar.click();
  await expect(page.getByText('Paso 2 de 4')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '¿Qué tecnologías te interesan?' })).toBeVisible();

  await page.getByRole('button', { name: 'React', exact: true }).click();
  await page.getByRole('button', { name: 'TypeScript', exact: true }).click();
  await page.getByPlaceholder('Otra tecnología…').fill('Cypress');
  await page.getByRole('button', { name: 'Agregar' }).click();
  await continuar.click();

  await expect(page.getByText('Paso 3 de 4')).toBeVisible();
  await page.getByRole('button', { name: 'Remoto', exact: true }).click();
  await page.getByPlaceholder('Ej: Buenos Aires, Argentina').fill('Córdoba, Argentina');
  await continuar.click();

  await expect(page.getByText('Paso 4 de 4')).toBeVisible();
  await page.getByRole('button', { name: 'Semi Senior' }).click();
  await page.getByRole('button', { name: 'Finalizar' }).click();

  // Tablero vacío: las 6 columnas, todas sin tarjetas.
  await expect(page).toHaveURL(/\/tablero$/);
  for (const estado of ESTADOS) {
    await expect(page.getByRole('heading', { name: estado, level: 3, exact: true })).toBeVisible();
  }
  await expect(page.getByText('Sin tarjetas')).toHaveCount(6);

  // Los criterios de Configuración reflejan exactamente lo elegido.
  await irA(page, 'Configuración');
  for (const tecnologia of ['React', 'TypeScript', 'Cypress', 'Remoto', 'Córdoba, Argentina']) {
    await expect(page.getByText(tecnologia, { exact: true })).toBeVisible();
  }

  const api = await conApiDe(cuenta);
  const { data: criterios } = await api.sb
    .from('criterios_scoring')
    .select('nombre, peso')
    .order('nombre');
  expect(criterios).toEqual([
    { nombre: 'Modalidad: Remoto', peso: 10 },
    { nombre: 'Stack: Cypress', peso: 15 },
    { nombre: 'Stack: React', peso: 15 },
    { nombre: 'Stack: TypeScript', peso: 15 },
    { nombre: 'Ubicación: Córdoba, Argentina', peso: 5 },
  ]);

  const { data: perfil } = await api.sb
    .from('perfil_usuario')
    .select('rol_buscado, seniority, modalidad_preferida, onboarding_completado, dias_inactividad_recordatorio')
    .single();
  expect(perfil).toEqual({
    rol_buscado: 'QA Automation Engineer',
    seniority: 'semi_senior',
    modalidad_preferida: 'remoto',
    onboarding_completado: true,
    dias_inactividad_recordatorio: 7,
  });
});
