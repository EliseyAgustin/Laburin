import { crearApi } from './api';
import { cuentaCompartida, cuentasTemporales, olvidarCuentasTemporales } from './cuentas';

// Borra todos los datos de las cuentas de prueba (compartidas y temporales). Los usuarios de Auth quedan.
export default async function globalTeardown() {
  const cuentas = [cuentaCompartida('desktop'), cuentaCompartida('mobile'), ...cuentasTemporales()];

  for (const cuenta of cuentas) {
    try {
      const api = await crearApi(cuenta);
      await api.borrarTodo();
      console.log(`[teardown] datos borrados: ${cuenta.email}`);
    } catch (err) {
      console.warn(`[teardown] no se pudo limpiar ${cuenta.email}: ${(err as Error).message}`);
    }
  }

  olvidarCuentasTemporales();
}
