import { expect, test } from '@playwright/test';
import { campoPassword } from './ui';

test.use({ storageState: { cookies: [], origins: [] } });

// Solo corre en el proyecto mobile (ver testIgnore en playwright.config.ts).
// SIMULACIÓN, no el teclado real: Chromium emulado no abre un teclado virtual. Lo que se reproduce es su efecto
// (el viewport visible se achica ~340 px) y se verifica que, al enfocar, la app deje el campo a la vista.
// La interacción real con el teclado de iOS/Android queda como zona ciega documentada (ver e2e/README.md).
test('con el viewport reducido por el teclado, el campo enfocado queda visible', async ({ page }) => {
  await page.goto('/');
  const alturaConTeclado = 812 - 340;
  await page.setViewportSize({ width: 375, height: alturaConTeclado });

  for (const campo of [page.getByLabel('Email'), campoPassword(page)]) {
    await campo.focus();
    await expect
      .poll(async () => {
        const caja = await campo.boundingBox();
        return caja !== null && caja.y >= 0 && caja.y + caja.height <= alturaConTeclado;
      })
      .toBe(true);
  }
});
