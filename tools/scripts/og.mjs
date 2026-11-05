// Renders public/og.png (1200×630) from tools/prompts/og.html.
// 1. Start the app (`npm run build && npm start`), 2. run `node tools/scripts/og.mjs [baseUrl]`.
// It captures the app into tools/prompts/app-shot.png first, then renders the card.
// Set CHROMIUM_PATH to use a specific Chromium binary.
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3000/";
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

const app = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
await app.addInitScript(() => {
  localStorage.setItem("theme", "dark");
  localStorage.setItem("lang", "es");
});
await app.goto(base);
await app.waitForSelector("#verdict");
await app.waitForTimeout(2500);
await app.screenshot({ path: "tools/prompts/app-shot.png", clip: { x: 0, y: 150, width: 1440, height: 640 } });

const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await card.goto(pathToFileURL(resolve("tools/prompts/og.html")).href);
await card.waitForTimeout(500);
await card.screenshot({ path: "public/og.png" });
console.log("public/og.png");
await browser.close();
