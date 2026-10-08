import { expect, test } from './fixtures';

const DIA = 24 * 60 * 60 * 1000;

test('umbral de inactividad: persiste, se valida y cambia cuándo aparece el recordatorio', async ({ page, api }) => {
  // Una postulación abierta hace 10 días (se retrasa la fecha sobre la propia fila de prueba, autenticado como el usuario).
  await api.sembrarOfertas([{ empresa: 'Orion Tech', rol: 'QA Engineer', stack_tecnologico: ['React'], puntaje_scoring: 25 }]);
  const { data: oferta } = await api.sb.from('ofertas').select('id').single();
  const postulacionId = await api.crearPostulacionDe(oferta!.id);
  const { error } = await api.sb
    .from('postulaciones')
    .update({ created_at: new Date(Date.now() - 10 * DIA).toISOString() })
    .eq('id', postulacionId);
  expect(error).toBeNull();

  const umbral = page.getByLabel('Umbral de inactividad en días');
  const guardarUmbral = async (dias: string) => {
    await umbral.fill(dias);
    await umbral.press('Tab');
  };
  const diasEnBase = async () => {
    const { data } = await api.sb.from('perfil_usuario').select('dias_inactividad_recordatorio').single();
    return data?.dias_inactividad_recordatorio;
  };
  const badge = page.getByText('Sin novedades hace 10 días');

  // --- El valor visible es el mismo que usa el motor (7) y se puede cambiar ---
  await page.goto('/mi-perfil');
  await expect(umbral).toHaveValue('7');
  await guardarUmbral('14');
  await expect.poll(diasEnBase).toBe(14);

  await page.reload();
  await expect(umbral).toHaveValue('14');

  // --- Validación de rango: se rechaza y vuelve al valor guardado ---
  for (const invalido of ['0', '91']) {
    await guardarUmbral(invalido);
    await expect(page.getByRole('alert')).toHaveText('Ingresá un número entero de 1 a 90 días.');
    await expect(umbral).toHaveValue('14');
  }
  expect(await diasEnBase()).toBe(14);

  // --- Con 14 días, una postulación de 10 días todavía no avisa ---
  await page.goto('/mis-postulaciones');
  await expect(page.getByRole('heading', { name: 'QA Engineer', level: 4 })).toBeVisible();
  await expect(badge).toHaveCount(0);

  // --- Con 7 días, avisa ---
  await page.goto('/mi-perfil');
  await guardarUmbral('7');
  await expect.poll(diasEnBase).toBe(7);
  await page.goto('/mis-postulaciones');
  await expect(badge).toBeVisible();

  // --- Política "solo hacia adelante": subir el umbral no borra el recordatorio ya generado ---
  await page.goto('/mi-perfil');
  await guardarUmbral('30');
  await expect.poll(diasEnBase).toBe(30);
  await page.goto('/mis-postulaciones');
  await expect(page.getByRole('heading', { name: 'QA Engineer', level: 4 })).toBeVisible();
  await expect(badge).toBeVisible();
});
