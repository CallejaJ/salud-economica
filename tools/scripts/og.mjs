// Renders public/og.png (1200×630) from tools/prompts/og.html: the logo only, centered.
// Run `node tools/scripts/og.mjs`. Set CHROMIUM_PATH to use a specific Chromium binary.
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await card.goto(pathToFileURL(resolve("tools/prompts/og.html")).href);
await card.waitForTimeout(500);
await card.screenshot({ path: "public/og.png" });
console.log("public/og.png");
await browser.close();
