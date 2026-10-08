import { expect, test as setup } from '@playwright/test';
import { crearApi } from './api';
import { cuentaCompartida, proyectoDe } from './cuentas';
import { campoPassword, iniciarSesionPorUI, omitirOnboarding, registrarPorUI } from './ui';

// Deja una sesión guardada de la cuenta compartida del proyecto. Si la cuenta no existe todavía,
// se crea por el flujo de registro de la app (no por la API), y recién ahí se resetea a un estado conocido.
setup('sesión de la cuenta compartida', async ({ page }, testInfo) => {
  const proyecto = proyectoDe(testInfo);
  const cuenta = cuentaCompartida(proyecto);

  await iniciarSesionPorUI(page, cuenta);
  const entro = await page
    .waitForURL(/\/(mis-postulaciones|onboarding)$/, { timeout: 8_000 })
    .then(() => true)
    .catch(() => false);

  if (!entro) {
    await expect(page.getByText(/Invalid login credentials/i)).toBeVisible();
    await registrarPorUI(page, cuenta);
    await omitirOnboarding(page);
  }

  // Estado conocido (perfil completo, umbral por defecto, criterios base) antes de guardar la sesión.
  const api = await crearApi(cuenta);
  await api.resetear();

  await page.goto('/mis-postulaciones');
  await expect(page).toHaveURL(/\/mis-postulaciones$/);
  await expect(campoPassword(page)).toHaveCount(0);
  await page.context().storageState({ path: `e2e/.auth/${proyecto}.json` });
});
