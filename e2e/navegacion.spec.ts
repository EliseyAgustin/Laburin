import { expect, test } from '@playwright/test';
import { irA } from './ui';

// Sesión compartida (storageState del proyecto).

const REDIRECCIONES = [
  { vieja: '/tablero', nueva: /\/mis-postulaciones$/ },
  { vieja: '/analytics', nueva: /\/mi-progreso$/ },
  { vieja: '/configuracion', nueva: /\/mi-perfil$/ },
];

for (const { vieja, nueva } of REDIRECCIONES) {
  test(`la URL anterior ${vieja} redirige a la pantalla nueva`, async ({ page }) => {
    await page.goto(vieja);
    await expect(page).toHaveURL(nueva);
  });
}

test('el menú usa los nombres nuevos y cada pantalla explica qué se hace ahí', async ({ page }) => {
  await page.goto('/ofertas');
  await expect(page.getByRole('heading', { name: 'Ofertas', level: 1 })).toBeVisible();

  await irA(page, 'Mis postulaciones');
  await expect(page).toHaveURL(/\/mis-postulaciones$/);
  await expect(page.getByRole('heading', { name: 'Mis postulaciones', level: 1 })).toBeVisible();
  await expect(page.getByText(/Seguí en qué etapa está cada postulación/)).toBeVisible();

  await irA(page, 'Mi progreso');
  await expect(page.getByRole('heading', { name: 'Mi progreso', level: 1 })).toBeVisible();

  await irA(page, 'Mi perfil de búsqueda');
  await expect(page.getByRole('heading', { name: 'Mi perfil de búsqueda', level: 1 })).toBeVisible();
  for (const bloque of ['¿Qué estoy buscando?', 'Mis tecnologías y cuánto pesan', 'Avisos de seguimiento']) {
    await expect(page.getByRole('heading', { name: bloque, level: 2 })).toBeVisible();
  }
});
