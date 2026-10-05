// Recaptura de las pantallas que cambiaron en el pase final: Ofertas (paginación, selección) y Configuración (umbral).
// Cuenta nueva de aspecto natural, creada por el flujo de registro de la app. Borra sus datos al terminar.
//
// Requisitos: la app corriendo (npm run dev, por defecto en http://localhost:3000; otra URL con BASE_URL)
// y VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env. No lleva credenciales: el email y la contraseña
// de la cuenta de captura se generan al azar en cada corrida.
// Uso: npm run docs:capturas
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = path.join(import.meta.dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });

const EMAIL = `camila.rojas.${Math.floor(1000 + Math.random() * 8999)}@gmail.com`;
const PASSWORD = `${crypto.randomBytes(9).toString('base64url')}-Lb9!`;

const EMPRESAS = ['Mercado Norte', 'Nubia Labs', 'Orbita Soft', 'Plano Digital', 'Kappa Systems', 'Lumen Tech', 'Andes Software', 'Pampa Cloud', 'Tango Data', 'Delta Soft', 'Horizonte IT', 'Quimera Apps'];
const ROLES = [
  ['Frontend Developer', ['React', 'TypeScript']],
  ['Full Stack Developer', ['React', 'Node.js']],
  ['Backend Developer', ['Node.js', 'PostgreSQL']],
  ['QA Automation Engineer', ['Selenium', 'Cypress']],
  ['Data Analyst', ['SQL', 'Power BI']],
  ['DevOps Engineer', ['AWS', 'Docker']],
  ['Mobile Developer', ['React Native', 'TypeScript']],
  ['Analista Funcional', ['Jira', 'SQL']],
];
const UBICACIONES = ['Buenos Aires, Argentina', 'Córdoba, Argentina', 'LATAM', 'Worldwide', 'Rosario, Argentina'];
const FUENTES = ['Remotive', 'Arbeitnow', 'Carga manual'];

function criteriosScore(oferta) {
  const stack = oferta.stack_tecnologico.map((s) => s.toLowerCase());
  let total = 0;
  for (const tech of ['react', 'typescript', 'node.js']) if (stack.some((s) => s.includes(tech))) total += 15;
  if (oferta.modalidad === 'remoto') total += 10;
  if ((oferta.ubicacion ?? '').toLowerCase().includes('buenos aires, argentina')) total += 5;
  return total;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

  // --- Registro y onboarding por la propia app ---
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '¿No tenés cuenta? Registrate' }).click();
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel(/^Contraseña/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Registrarme' }).click();
  await page.waitForURL(/\/onboarding/);

  await page.getByPlaceholder('Ej: Frontend Developer').fill('Frontend Developer');
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const tech of ['React', 'TypeScript', 'Node.js']) await page.getByRole('button', { name: tech, exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Remoto', exact: true }).click();
  await page.getByPlaceholder('Ej: Buenos Aires, Argentina').fill('Buenos Aires, Argentina');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Semi Senior' }).click();
  await page.getByRole('button', { name: 'Finalizar' }).click();
  await page.waitForURL(/\/tablero/);

  // --- Ofertas realistas con el cliente autenticado (RLS) ---
  const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data: sesion, error: loginError } = await sb.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (loginError) throw loginError;
  const userId = sesion.user.id;

  const base = Date.now() - 6 * 60 * 60 * 1000;
  const filas = Array.from({ length: 34 }, (_, i) => {
    const [rol, stack] = ROLES[i % ROLES.length];
    const oferta = {
      user_id: userId,
      empresa: EMPRESAS[(i * 5) % EMPRESAS.length],
      rol,
      ubicacion: UBICACIONES[(i * 3) % UBICACIONES.length],
      modalidad: i % 4 === 3 ? 'hibrido' : 'remoto',
      stack_tecnologico: stack,
      fuente: FUENTES[i % FUENTES.length],
      fecha_publicacion: new Date(base - i * 86400000).toISOString().slice(0, 10),
      created_at: new Date(base - i * 60000).toISOString(),
    };
    return { ...oferta, puntaje_scoring: criteriosScore(oferta) };
  });
  const { error: seedError } = await sb.from('ofertas').insert(filas);
  if (seedError) throw seedError;

  // --- Capturas ---
  const shot = async (name) => {
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('capturado:', name);
  };

  await page.goto(`${BASE}/ofertas`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { level: 3 }).first().waitFor();
  await shot('04a-ofertas');

  await page.getByRole('navigation', { name: 'Paginación de ofertas' }).scrollIntoViewIfNeeded();
  await shot('04c-ofertas-paginacion');

  await page.goto(`${BASE}/configuracion`, { waitUntil: 'networkidle' });
  await page.getByText('Stack Tecnológico').first().waitFor();
  await shot('07-configuracion');

  // --- Limpieza: se borran los datos de la cuenta de la captura ---
  for (const tabla of ['ofertas', 'criterios_scoring', 'perfil_usuario']) {
    await sb.from(tabla).delete().eq('user_id', userId);
  }
  await browser.close();
  console.log('Listo. Cuenta usada:', EMAIL, '(datos borrados)');
}

main().catch((e) => {
  console.error('ERROR:', e);
  process.exitCode = 1;
});
