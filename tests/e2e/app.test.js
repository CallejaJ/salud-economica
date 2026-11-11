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
  await page.waitForSelector('#pace[data-pace="calm"]');

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

test('uploading the same statement again updates it, and a month can be cleared at once', async () => {
  const page = await browser.newPage();
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const pdf = await statementPdf();

  for (const category of [null, 'leisure']) {
    await page.click('#tab-import');
    await page.setInputFiles('#statement-file', pdf);
    await page.waitForSelector('#review', { timeout: 20000 });
    if (category) await page.locator('#review select').first().selectOption(category);
    await page.click('#review-save');
    await page.waitForSelector('#verdict');
  }
  assert.equal(await page.locator('#entry-list li').count(), 3);
  assert.match(await page.textContent('#toast'), /3/);
  assert.equal(await page.locator('#entry-list .cat-leisure').count(), 1);

  // Moving an entry by hand survives another upload of the same statement.
  await page.locator('#entry-list button.cat-change').first().click();
  await page.locator('#entry-list .cat-pick button[data-cat="school"]').click();
  await page.waitForSelector('#entry-list .cat-school');
  await page.click('#tab-import');
  await page.setInputFiles('#statement-file', pdf);
  await page.waitForSelector('#review', { timeout: 20000 });
  await page.click('#review-save');
  await page.waitForSelector('#verdict');
  assert.equal(await page.locator('#entry-list li').count(), 3);
  assert.equal(await page.locator('#entry-list .cat-school').count(), 1);

  await page.click('#clear-month');
  await page.click('#clear-month-yes');
  await page.waitForSelector('.example-badge');
  await page.close();
});

test('deletes all data after one confirmation', async () => {
  const page = await browser.newPage();
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('#tab-add');
  await page.click('#kind-income');
  await page.fill('#amount', '1000');
  await page.click('#save');
  await page.waitForSelector('#verdict[data-verdict="good"]');

  await page.click('#wipe');
  await page.click('#wipe-yes');
  await page.waitForSelector('.example-badge');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('salud-economica.entries')).length), 0);
  await page.close();
});

test('downloads a JSON copy and loads it back after the data is gone', async () => {
  const page = await browser.newPage({ acceptDownloads: true });
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  assert.equal(await page.isDisabled('#backup-download'), true);

  await page.click('#tab-add');
  await page.click('#kind-income');
  await page.fill('#amount', '1000');
  await page.click('#save');
  await page.waitForSelector('#verdict[data-verdict="good"]');

  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#backup-download')]);
  assert.match(download.suggestedFilename(), /^salud-economica-\d{4}-\d{2}-\d{2}\.json$/);
  const file = path.join(tmp, 'copia.json');
  await download.saveAs(file);
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(backup.entries.length, 1);

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.example-badge');
  await page.setInputFiles('#backup-file', file);
  await page.waitForSelector('.example-badge', { state: 'detached' });
  await page.waitForFunction(() => document.querySelectorAll('#entry-list li').length === 1);

  await page.setInputFiles('#backup-file', file);
  await page.waitForSelector('#toast');
  assert.equal(await page.locator('#entry-list li').count(), 1);
  await page.close();
});

test('serves the SEO files', async () => {
  for (const p of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest', 'favicon.ico', 'og.png']) {
    assert.equal((await fetch(BASE + p)).status, 200, p);
  }
});

test('shows the pace of the month only for the current month', async () => {
  const page = await browser.newPage();
  await page.clock.setFixedTime(new Date(2026, 10, 11, 12));
  const mk = (id, kind, category, amount) => ({ id, kind, category, amount, note: '', month: '2026-11', recurring: false, createdAt: 0 });
  await page.addInitScript((e) => localStorage.setItem('salud-economica.entries', e), JSON.stringify([mk('a', 'income', 'income', 1500), mk('b', 'expense', 'home', 1100)]));
  await page.goto(BASE);
  await page.waitForSelector('#pace[data-pace="fast"]');
  await page.click('.pace-row[data-bar="money"]');
  assert.match(await page.textContent('.pace-tip'), /about €400 left/);
  await page.keyboard.press('Escape');
  await page.waitForSelector('.pace-tip', { state: 'detached' });
  await page.click('[aria-label="Previous month"]');
  await page.waitForSelector('#pace', { state: 'detached' });
  await page.close();
});
