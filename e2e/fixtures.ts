import { test as base } from '@playwright/test';
import { crearApi, type Api } from './api';
import { cuentaCompartida, proyectoDe, type Cuenta, type Proyecto } from './cuentas';

interface Fixtures {
  proyecto: Proyecto;
  cuenta: Cuenta;
  // Cliente autenticado de la cuenta compartida del proyecto, con la cuenta ya reseteada a un estado conocido.
  api: Api;
}

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  proyecto: async ({}, use, testInfo) => use(proyectoDe(testInfo)),
  cuenta: async ({ proyecto }, use) => use(cuentaCompartida(proyecto)),
  api: async ({ cuenta }, use) => {
    const api = await crearApi(cuenta);
    await api.resetear();
    await use(api);
  },
});

export { expect } from '@playwright/test';
