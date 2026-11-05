// Generates the PNG icon set from public/favicon.svg using the preinstalled Playwright Chromium.
// Usage: node tools/scripts/icons.mjs [path/to/favicon.svg] [output/dir]
// Also writes favicon.ico by wrapping the 48 px PNG in an ICO container.
// Set CHROMIUM_PATH to use a specific Chromium binary.
import { readFile, rm, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const svgPath = process.argv[2] || "public/favicon.svg";
const outDir = process.argv[3] || "public";
const svg = await readFile(svgPath, "utf8");
const sizes = { "apple-touch-icon.png": 180, "icon-192.png": 192, "icon-512.png": 512, "icon-48.png": 48 };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const [name, size] of Object.entries(sizes)) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace("<svg", `<svg width="${size}" height="${size}"`)}</body></html>`,
  );
  await page.locator("svg").screenshot({ path: `${outDir}/${name}`, omitBackground: true });
  console.log(`${outDir}/${name}`);
}
await browser.close();

// ICO header (6 bytes) + one directory entry (16 bytes) + the PNG itself.
const png = await readFile(`${outDir}/icon-48.png`);
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6);
header.writeUInt8(48, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(`${outDir}/favicon.ico`, Buffer.concat([header, png]));
await rm(`${outDir}/icon-48.png`);
console.log(`${outDir}/favicon.ico`);
