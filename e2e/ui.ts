import { expect, type Page, type TestInfo } from '@playwright/test';
import { crearApi, type Api } from './api';
import { registrarCuentaTemporal, emailNuevo, passwordDePrueba, type Cuenta } from './cuentas';

export const esMobile = (info: Pick<TestInfo, 'project'>) => info.project.name.includes('mobile');

// El campo "Contraseña" comparte <label> con el botón de mostrar/ocultar: se matchea por prefijo.
export const campoPassword = (page: Page) => page.getByLabel(/^Contraseña/);

export async function iniciarSesionPorUI(page: Page, { email, password }: Cuenta) {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await campoPassword(page).fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

export async function registrarPorUI(page: Page, cuenta?: Cuenta): Promise<Cuenta> {
  const datos = cuenta ?? { email: emailNuevo(), password: passwordDePrueba() };
  await page.goto('/');
  await page.getByRole('button', { name: '¿No tenés cuenta? Registrate' }).click();
  await page.getByLabel('Email').fill(datos.email);
  await campoPassword(page).fill(datos.password);
  await page.getByRole('button', { name: 'Registrarme' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  registrarCuentaTemporal(datos);
  return datos;
}

export async function omitirOnboarding(page: Page) {
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  await expect(page).toHaveURL(/\/mis-postulaciones$/);
}

// En mobile el menú lateral está cerrado: hay que abrirlo antes de usar la navegación o "Mi cuenta".
export async function abrirMenuSiHaceFalta(page: Page) {
  const abrir = page.getByRole('button', { name: 'Abrir menú' });
  if (await abrir.isVisible()) await abrir.click();
}

export async function irA(page: Page, seccion: 'Ofertas' | 'Mis postulaciones' | 'Mi progreso' | 'Mi perfil de búsqueda') {
  await abrirMenuSiHaceFalta(page);
  await page.getByRole('link', { name: seccion, exact: true }).click();
}

export async function conApiDe(cuenta: Cuenta): Promise<Api> {
  return crearApi(cuenta);
}

export function aceptarDialogos(page: Page) {
  page.on('dialog', (dialog) => dialog.accept());
}
