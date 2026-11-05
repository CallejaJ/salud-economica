// End-to-end test: starts the production build, drives it in Chromium and checks the main flows.
// Run `npm run build` first. Set CHROMIUM_PATH to use a specific Chromium binary.
// ANTHROPIC_API_KEY is removed so the statement import uses the built-in regex reader.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { PDFDocument, StandardFonts } = require('pdf-lib');

const PORT = 3200 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}/`;
let server, browser, tmp;

async function waitForServer(url, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not start at ${url}`);
}

async function statementPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage();
  const lines = [
    'EXTRACTO DE CUENTA',
    '01/10/2026 NOMINA EMPRESA SL 1.500,00 2.000,00',
    '03/10/2026 COMPRA MERCADONA -60,25 1.939,75',
    '05/10/2026 RECIBO ENDESA -80,00 1.859,75',
  ];
  lines.forEach((l, i) => page.drawText(l, { x: 40, y: 760 - i * 24, size: 12, font }));
  const file = path.join(tmp, 'extracto.pdf');
  fs.writeFileSync(file, await doc.save());
  return file;
}

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'salud-economica-'));
  const env = { ...process.env, PORT: String(PORT) };
  delete env.ANTHROPIC_API_KEY;
  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', String(PORT)], { env, stdio: 'ignore' });
  await waitForServer(BASE);
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
});

after(async () => {
  await browser?.close();
  server?.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('shows a labeled example, then the real verdict after adding entries', async () => {
  const page = await browser.newPage();
  await page.goto(BASE);
  await page.waitForSelector('.example-badge');

  await page.click('#tab-add');
  await page.click('#kind-income');
  await page.fill('#amount', '1000');
  await page.click('#save');
  await page.waitForSelector('#verdict[data-verdict="good"]');
  assert.equal(await page.locator('.example-badge').count(), 0);

  await page.click('#tab-add');
  await page.click('[data-cat="home"]');
  await page.fill('#amount', '950');
  await page.click('#save');
  await page.waitForSelector('#verdict[data-verdict="tight"]');

  await page.click('#tab-add');
  await page.fill('#amount', 'abc');
  await page.click('#save');
  await page.waitForSelector('.field-error');
  await page.close();
});

test('repeats a quarterly expense only in the months it falls due', async () => {
  const page = await browser.newPage();
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.click('#tab-add');
  await page.click('#kind-income');
  await page.fill('#amount', '1000');
  await page.check('#recurring');
  await page.click('#save');
  await page.waitForSelector('#verdict[data-verdict="good"]');

  await page.click('#tab-add');
  await page.click('[data-cat="bills"]');
  await page.fill('#amount', '960');
  await page.check('#recurring');
  await page.click('[data-every="3"]');
  assert.match(await page.textContent('#every-hint'), /320/);
  await page.click('#save');
  await page.waitForSelector('#verdict[data-verdict="tight"]');

  const next = page.locator('.month-btn').nth(1);
  await next.click();
  await page.waitForSelector('#verdict[data-verdict="good"]');
  await next.click();
  await page.waitForSelector('#verdict[data-verdict="good"]');
  await next.click();
  await page.waitForSelector('#verdict[data-verdict="tight"]');
  await page.close();
});

test('imports a bank statement PDF after review', async () => {
  const page = await browser.newPage();
  await page.goto(BASE);
  await page.click('#tab-import');
  await page.setInputFiles('#statement-file', await statementPdf());
  await page.waitForSelector('#review', { timeout: 20000 });
  assert.equal(await page.locator('#review .review-row').count(), 3);

  await page.click('#review-save');
  await page.waitForSelector('#verdict');
  assert.match(await page.textContent('#month-name'), /2026/);
  assert.equal(await page.getAttribute('#verdict', 'data-verdict'), 'good');
  assert.equal(await page.locator('#entry-list li').count(), 3);
  await page.close();
});

test('serves the SEO files', async () => {
  for (const p of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest', 'favicon.ico', 'og.png']) {
    assert.equal((await fetch(BASE + p)).status, 200, p);
  }
});
