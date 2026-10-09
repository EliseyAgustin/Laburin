import { createClient, type PostgrestSingleResponse, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';
import { crearApi } from './api';
import { cuentaAdministrador, emailNuevo, passwordDePrueba, registrarCuentaTemporal } from './cuentas';

// Prueba adversarial de seguridad contra la base real, sin navegador y sin service role key: todo se hace con la
// clave pública y sesiones reales, o sea con las mismas reglas (RLS y permisos) que tiene un usuario de la app.
// Dos candidatos propios (se crean al empezar; sus datos se borran al terminar) y la cuenta de administrador de
// pruebas (E2E_ADMIN_*), con la que solo se inicia sesión.
//
// Convención de lo que se espera ante un ataque:
//  - tabla/vista/columna sin permiso            -> error 42501 (permission denied)
//  - política RLS que rechaza una escritura     -> error 42501 (violates row-level security)
//  - lectura/update/delete filtrado por RLS     -> 0 filas, y se comprueba que el dato siga intacto.

test.describe.configure({ mode: 'serial', timeout: 180_000 });

const url = process.env.VITE_SUPABASE_URL!;
const anon = process.env.VITE_SUPABASE_ANON_KEY!;
const TEXTO_BIENVENIDA = 'Tu perfil quedó registrado y vamos a tener en cuenta tu solicitud.';

interface Sesion {
  sb: SupabaseClient;
  userId: string;
  email: string;
}

const cliente = () => createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });

async function registrarCandidato(): Promise<Sesion> {
  const email = emailNuevo();
  const password = passwordDePrueba();
  const sb = cliente();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error || !data.user || !data.session) throw new Error(`No se pudo registrar ${email}: ${error?.message ?? 'sin sesión'}`);
  registrarCuentaTemporal({ email, password }); // el teardown le borra los datos
  return { sb, userId: data.user.id, email };
}

async function sesionAdministrador(): Promise<Sesion> {
  const cuenta = cuentaAdministrador(); // falla con un mensaje claro si falta E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
  const api = await crearApi(cuenta);
  return { sb: api.sb, userId: api.userId, email: cuenta.email };
}

const log = (prueba: string, resultado: string) => console.log(`[adv] ${prueba} -> ${resultado}`);

function describir({ data, error }: Pick<PostgrestSingleResponse<unknown>, 'data' | 'error'>): string {
  if (error) return `rechazado (${error.code}: ${error.message})`;
  if (Array.isArray(data)) return `${data.length} fila(s)`;
  return data === null ? '0 filas' : '1 fila';
}

// Ataque que debe ser rechazado con error de permisos / RLS.
function denegado(prueba: string, res: Pick<PostgrestSingleResponse<unknown>, 'data' | 'error'>) {
  log(prueba, describir(res));
  expect(res.error?.code, `${prueba}: debía rechazarse con 42501`).toBe('42501');
}

// Ataque que RLS deja sin efecto: sin error pero sin filas.
function sinFilas(prueba: string, res: Pick<PostgrestSingleResponse<unknown>, 'data' | 'error'>) {
  log(prueba, describir(res));
  expect(res.error, `${prueba}: no debía dar error`).toBeNull();
  expect(res.data ?? []).toEqual([]);
}

let A: Sesion;
let B: Sesion;
let ofertaDeA = '';
let postulacionDeA = '';
let mensajeBienvenidaDeB = '';

test.beforeAll(async () => {
  A = await registrarCandidato();
  B = await registrarCandidato();

  for (const [s, nombre, rol] of [[A, 'Candidata A', 'QA Automation'], [B, 'Candidato B', 'Data Analyst']] as const) {
    const { error } = await s.sb
      .from('perfil_usuario')
      .insert({ user_id: s.userId, nombre, rol_buscado: rol, stack_interes: ['SQL'], ubicacion: 'Argentina', modalidad_preferida: 'remoto', onboarding_completado: true });
    expect(error, `perfil de ${nombre}`).toBeNull();
  }

  // Datos privados de A (los que el administrador no debe poder ver jamás).
  const { data: oferta } = await A.sb.from('ofertas').insert({ user_id: A.userId, empresa: 'Privada SA', rol: 'Oferta de A' }).select('id').single();
  ofertaDeA = oferta!.id;
  const { data: post } = await A.sb.from('postulaciones').insert({ oferta_id: ofertaDeA }).select('id').single();
  postulacionDeA = post!.id;
  await A.sb.from('interacciones').insert({ postulacion_id: postulacionDeA, tipo: 'nota', notas: 'nota privada de A' });
  await A.sb.from('recordatorios').insert({ postulacion_id: postulacionDeA, dias_inactividad: 9 });
  await A.sb.from('criterios_scoring').insert({
    user_id: A.userId, nombre: 'Stack: SQL', peso: 15, tipo_coincidencia: 'contiene', campo_objetivo: 'stack_tecnologico', valor_comparacion: 'SQL',
  });

  const { data: bienvenidaB } = await B.sb.from('mensajes').select('id').eq('tipo', 'bienvenida').single();
  mensajeBienvenidaDeB = bienvenidaB!.id;
});

test.afterAll(async () => {
  // Los mensajes recibidos los borra su destinatario; el resto lo limpia el teardown global.
  for (const s of [A, B]) {
    if (s) await s.sb.from('mensajes').delete().eq('destinatario_id', s.userId);
  }
});

test.describe('mensaje de bienvenida (trigger)', () => {
  test('al completar el perfil con un rol, el candidato recibe una sola bienvenida del sistema', async () => {
    const { data, error } = await A.sb.from('mensajes').select('*').eq('tipo', 'bienvenida');
    expect(error).toBeNull();
    log('bienvenida de A', `${data!.length} mensaje(s): "${data![0]?.texto}"`);
    expect(data).toHaveLength(1);
    expect(data![0]).toMatchObject({ destinatario_id: A.userId, remitente_id: null, texto: TEXTO_BIENVENIDA, leido: false });

    // Volver a tocar el perfil no la duplica.
    await A.sb.from('perfil_usuario').update({ ubicacion: 'Córdoba' }).eq('user_id', A.userId);
    const { data: otra } = await A.sb.from('mensajes').select('id').eq('tipo', 'bienvenida');
    expect(otra).toHaveLength(1);
  });

  test('quien omite el Onboarding (sin rol buscado) no recibe bienvenida', async () => {
    const omitidor = await registrarCandidato();
    await omitidor.sb.from('perfil_usuario').insert({ user_id: omitidor.userId, onboarding_completado: true });
    const { data } = await omitidor.sb.from('mensajes').select('id');
    log('bienvenida a quien omitió el Onboarding', `${data!.length} mensaje(s)`);
    expect(data).toEqual([]);
  });
});

test.describe('un candidato intenta ver o tocar lo de otro candidato', () => {
  test('lectura: solo ve lo propio', async () => {
    const perfiles = await A.sb.from('perfil_usuario').select('user_id');
    log('A lee perfil_usuario (sin filtro)', describir(perfiles));
    expect(perfiles.data).toEqual([{ user_id: A.userId }]);

    sinFilas('A lee el perfil de B', await A.sb.from('perfil_usuario').select('*').eq('user_id', B.userId));
    sinFilas('A lee los mensajes de B', await A.sb.from('mensajes').select('*').eq('destinatario_id', B.userId));
    sinFilas('A lee el mensaje de bienvenida de B por id', await A.sb.from('mensajes').select('*').eq('id', mensajeBienvenidaDeB));
    const propios = await A.sb.from('mensajes').select('destinatario_id');
    expect(propios.data!.every((m) => m.destinatario_id === A.userId)).toBe(true);

    for (const tabla of ['ofertas', 'postulaciones', 'interacciones', 'recordatorios', 'criterios_scoring', 'postulacion_historial_estados']) {
      sinFilas(`A lee ${tabla} de B`, await A.sb.from(tabla).select('*').eq('user_id', B.userId));
    }
  });

  test('escritura sobre datos de B: sin efecto', async () => {
    const perfil = await A.sb.from('perfil_usuario').update({ nombre: 'Hackeado' }).eq('user_id', B.userId).select();
    sinFilas('A modifica el perfil de B', perfil);
    const { data: intacto } = await B.sb.from('perfil_usuario').select('nombre').single();
    expect(intacto!.nombre).toBe('Candidato B');

    sinFilas('A marca como leído un mensaje de B', await A.sb.from('mensajes').update({ leido: true }).eq('id', mensajeBienvenidaDeB).select());
    sinFilas('A borra un mensaje de B', await A.sb.from('mensajes').delete().eq('id', mensajeBienvenidaDeB).select());
    const { data: sigue } = await B.sb.from('mensajes').select('leido').eq('id', mensajeBienvenidaDeB).single();
    expect(sigue).toEqual({ leido: false });

    denegado('A inserta un perfil a nombre de B', await A.sb.from('perfil_usuario').insert({ user_id: B.userId }));
    denegado('A inserta una oferta a nombre de B', await A.sb.from('ofertas').insert({ user_id: B.userId, empresa: 'x', rol: 'y' }));
  });

  test('mensajes: no puede enviar ni falsificar, y de los propios solo cambia "leído"', async () => {
    denegado('A envía un mensaje a B como remitente A', await A.sb.from('mensajes').insert({ remitente_id: A.userId, destinatario_id: B.userId, tipo: 'admin', texto: 'hola' }));
    denegado('A envía un mensaje a B haciéndose pasar por el sistema', await A.sb.from('mensajes').insert({ remitente_id: null, destinatario_id: B.userId, tipo: 'bienvenida', texto: 'falso' }));
    denegado('A se envía un mensaje "admin" a sí misma', await A.sb.from('mensajes').insert({ remitente_id: A.userId, destinatario_id: A.userId, tipo: 'admin', texto: 'me ascendieron' }));

    const propio = (await A.sb.from('mensajes').select('id').eq('tipo', 'bienvenida').single()).data!;
    denegado('A edita el texto de su mensaje', await A.sb.from('mensajes').update({ texto: 'editado' }).eq('id', propio.id));
    denegado('A cambia el remitente de su mensaje', await A.sb.from('mensajes').update({ remitente_id: B.userId }).eq('id', propio.id));
    denegado('A cambia el destinatario de su mensaje', await A.sb.from('mensajes').update({ destinatario_id: B.userId }).eq('id', propio.id));

    const leido = await A.sb.from('mensajes').update({ leido: true }).eq('id', propio.id).select();
    log('A marca como leído su propio mensaje', describir(leido));
    expect(leido.data).toHaveLength(1);
    const texto = (await A.sb.from('mensajes').select('texto').eq('id', propio.id).single()).data!;
    expect(texto.texto).toBe(TEXTO_BIENVENIDA);
  });
});

test.describe('un candidato intenta escalar su rol o usar la vista de administrador', () => {
  test('roles_usuario: puede leer lo propio y nada más; no puede escribir', async () => {
    sinFilas('A lee roles_usuario (no tiene fila: es candidato)', await A.sb.from('roles_usuario').select('*'));
    denegado('A se inserta el rol administrador', await A.sb.from('roles_usuario').insert({ user_id: A.userId, rol: 'administrador' }));
    denegado('A hace upsert de su rol', await A.sb.from('roles_usuario').upsert({ user_id: A.userId, rol: 'administrador' }));
    denegado('A actualiza roles_usuario', await A.sb.from('roles_usuario').update({ rol: 'administrador' }).eq('user_id', A.userId));
    denegado('A borra de roles_usuario', await A.sb.from('roles_usuario').delete().eq('user_id', A.userId));
    const es = await A.sb.rpc('es_administrador');
    log('A llama es_administrador()', `${es.data}`);
    expect(es.data).toBe(false);
  });

  test('candidatos: devuelve 0 filas y no admite escrituras', async () => {
    sinFilas('A lee la vista candidatos', await A.sb.from('candidatos').select('*'));
    denegado('A inserta en candidatos', await A.sb.from('candidatos').insert({ user_id: A.userId, nombre: 'x' }));
    denegado('A actualiza candidatos', await A.sb.from('candidatos').update({ nombre: 'x' }).eq('user_id', B.userId));
    denegado('A borra de candidatos', await A.sb.from('candidatos').delete().eq('user_id', B.userId));
  });

  test('sin sesión (anon): no lee nada de lo nuevo', async () => {
    const anonimo = cliente();
    denegado('anon lee candidatos', await anonimo.from('candidatos').select('*'));
    denegado('anon lee roles_usuario', await anonimo.from('roles_usuario').select('*'));
    denegado('anon lee mensajes', await anonimo.from('mensajes').select('*'));
    denegado('anon inserta mensajes', await anonimo.from('mensajes').insert({ destinatario_id: A.userId, tipo: 'admin', texto: 'x' }));
    // perfil_usuario conserva su política de siempre: anon no ve filas (o ni siquiera tiene permiso de lectura).
    const perfiles = await anonimo.from('perfil_usuario').select('*');
    log('anon lee perfil_usuario', describir(perfiles));
    expect(perfiles.error ? perfiles.error.code === '42501' : (perfiles.data ?? []).length === 0).toBe(true);
    const es = await anonimo.rpc('es_administrador');
    denegado('anon llama es_administrador()', es);
  });
});

test.describe('el administrador', () => {
  let admin: Sesion;
  test.beforeAll(async () => {
    admin = await sesionAdministrador();
  });

  test('ve solo el perfil de búsqueda de los candidatos, con las columnas acordadas', async () => {
    const { data, error } = await admin.sb.from('candidatos').select('*').in('user_id', [A.userId, B.userId]);
    expect(error).toBeNull();
    log('admin lee candidatos (A y B)', `${data!.length} fila(s), columnas: ${Object.keys(data![0]).join(', ')}`);
    expect(data).toHaveLength(2);
    expect(Object.keys(data![0]).sort()).toEqual(
      ['modalidad_preferida', 'nombre', 'registrado_el', 'rol_buscado', 'seniority', 'stack_interes', 'ubicacion', 'user_id'].sort()
    );
    const delAdmin = await admin.sb.from('candidatos').select('user_id').eq('user_id', admin.userId);
    sinFilas('admin se ve a sí mismo en candidatos', delAdmin);

    // Lo que NO está en la vista: umbral de recordatorios, onboarding_completado, email.
    for (const columna of ['dias_inactividad_recordatorio', 'onboarding_completado', 'email']) {
      const res = await admin.sb.from('candidatos').select(columna);
      log(`admin pide la columna ${columna} a la vista`, describir(res));
      expect(res.error?.code, `${columna} no debe existir en la vista`).toBe('42703'); // undefined_column
    }
  });

  test('no lee ofertas, postulaciones, interacciones, recordatorios ni nada privado de los candidatos', async () => {
    const privadas = ['ofertas', 'postulaciones', 'interacciones', 'recordatorios', 'criterios_scoring', 'postulacion_historial_estados'];
    for (const tabla of privadas) {
      sinFilas(`admin lee ${tabla} de A y B`, await admin.sb.from(tabla).select('*').in('user_id', [A.userId, B.userId]));
    }
    // También sin filtrar: lo único que podría ver es lo propio (el administrador no carga ofertas).
    const oferta = await admin.sb.from('ofertas').select('*').eq('id', ofertaDeA);
    sinFilas('admin lee la oferta de A por id', oferta);
    sinFilas('admin lee el perfil_usuario crudo de A y B', await admin.sb.from('perfil_usuario').select('*').in('user_id', [A.userId, B.userId]));
    const nota = await admin.sb.from('interacciones').select('notas').eq('postulacion_id', postulacionDeA);
    sinFilas('admin lee la nota privada de A', nota);
  });

  test('no puede insertar, actualizar ni borrar en candidatos, perfil_usuario ni roles_usuario', async () => {
    denegado('admin inserta en candidatos', await admin.sb.from('candidatos').insert({ user_id: A.userId, nombre: 'x' }));
    denegado('admin actualiza candidatos', await admin.sb.from('candidatos').update({ nombre: 'x' }).eq('user_id', A.userId));
    denegado('admin borra de candidatos', await admin.sb.from('candidatos').delete().eq('user_id', A.userId));

    denegado('admin inserta un perfil a nombre de A', await admin.sb.from('perfil_usuario').insert({ user_id: A.userId }));
    sinFilas('admin actualiza el perfil de A', await admin.sb.from('perfil_usuario').update({ nombre: 'Hackeado' }).eq('user_id', A.userId).select());
    sinFilas('admin borra el perfil de A', await admin.sb.from('perfil_usuario').delete().eq('user_id', A.userId).select());
    const { data: intacto } = await A.sb.from('perfil_usuario').select('nombre').single();
    expect(intacto!.nombre).toBe('Candidata A');

    denegado('admin inserta en roles_usuario', await admin.sb.from('roles_usuario').insert({ user_id: A.userId, rol: 'administrador' }));
    denegado('admin actualiza roles_usuario', await admin.sb.from('roles_usuario').update({ rol: 'candidato' }).eq('user_id', admin.userId));
    denegado('admin borra de roles_usuario', await admin.sb.from('roles_usuario').delete().eq('user_id', admin.userId));
    const sigue = await admin.sb.rpc('es_administrador');
    expect(sigue.data).toBe(true);
  });

  test('envía mensajes como él mismo; no falsifica remitente ni tipo, ni lee, edita o borra lo ajeno', async () => {
    const enviado = await admin.sb
      .from('mensajes')
      .insert({ remitente_id: admin.userId, destinatario_id: A.userId, tipo: 'admin', texto: 'Falta tu ubicación exacta.' })
      .select('id')
      .single();
    log('admin envía un mensaje a A', describir(enviado));
    expect(enviado.error).toBeNull();
    const idMensaje = enviado.data!.id;

    denegado('admin envía como otro remitente', await admin.sb.from('mensajes').insert({ remitente_id: B.userId, destinatario_id: A.userId, tipo: 'admin', texto: 'x' }));
    denegado('admin envía un mensaje tipo bienvenida', await admin.sb.from('mensajes').insert({ remitente_id: admin.userId, destinatario_id: A.userId, tipo: 'bienvenida', texto: 'x' }));
    // Validación de datos (no de permisos): la base rechaza el texto vacío y el de más de 1000 caracteres (23514).
    for (const [prueba, texto] of [['vacío', '   '], ['de más de 1000 caracteres', 'x'.repeat(1001)]] as const) {
      const res = await admin.sb.from('mensajes').insert({ remitente_id: admin.userId, destinatario_id: A.userId, tipo: 'admin', texto });
      log(`admin envía un mensaje ${prueba}`, describir(res));
      expect(res.error?.code).toBe('23514');
    }

    // Ve lo que envió, pero no lo que otros recibieron del sistema.
    const propios = await admin.sb.from('mensajes').select('id').eq('destinatario_id', A.userId);
    expect(propios.data!.map((m) => m.id)).toEqual([idMensaje]);
    sinFilas('admin lee la bienvenida de B', await admin.sb.from('mensajes').select('*').eq('id', mensajeBienvenidaDeB));

    denegado('admin edita el texto de su mensaje enviado', await admin.sb.from('mensajes').update({ texto: 'otro' }).eq('id', idMensaje));
    sinFilas('admin marca como leído un mensaje de A', await admin.sb.from('mensajes').update({ leido: true }).eq('id', idMensaje).select());
    sinFilas('admin borra el mensaje enviado a A', await admin.sb.from('mensajes').delete().eq('id', idMensaje).select());
    sinFilas('admin borra la bienvenida de B', await admin.sb.from('mensajes').delete().eq('id', mensajeBienvenidaDeB).select());

    // Del lado del candidato: lo ve sin leer, lo marca como leído y no puede cambiarlo.
    const recibido = await A.sb.from('mensajes').select('texto, leido, remitente_id').eq('id', idMensaje).single();
    expect(recibido.data).toEqual({ texto: 'Falta tu ubicación exacta.', leido: false, remitente_id: admin.userId });
    const leido = await A.sb.from('mensajes').update({ leido: true }).eq('id', idMensaje).select();
    expect(leido.data).toHaveLength(1);
    denegado('A edita el texto de un mensaje del administrador', await A.sb.from('mensajes').update({ texto: 'modificado por A' }).eq('id', idMensaje));

    const visto = await admin.sb.from('mensajes').select('leido').eq('id', idMensaje).single();
    log('el administrador ve el mensaje enviado como', visto.data!.leido ? 'leído' : 'sin leer');
    expect(visto.data).toEqual({ leido: true });
  });
});
