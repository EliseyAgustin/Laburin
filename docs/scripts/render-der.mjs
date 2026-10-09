// Renderiza der.html (diagrama entidad-relación) a capturas/09-der.png.
// Uso: npm run docs:der
import { chromium } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const AQUI = import.meta.dirname;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1220 } });
await page.goto(pathToFileURL(path.join(AQUI, 'der.html')).href);
await page.screenshot({ path: path.join(AQUI, 'capturas', '09-der.png') });
await browser.close();
console.log('Diagrama regenerado: docs/scripts/capturas/09-der.png');
