// Explores the English UI: lists buttons per page and saves full-page previews.
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.argv[2], "_"))
const puppeteer = require("puppeteer-core")
const OUT = path.join(here, "explore-en"); fs.mkdirSync(OUT, { recursive: true })
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" })
const page = await browser.newPage()
await page.evaluateOnNewDocument(() => { localStorage.setItem("causaseal-language", "en"); localStorage.setItem("theme", "light") })
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
for (const r of ["/", "/architecture", "/investigate", "/memory", "/lab", "/impact", "/monitor", "/reports", "/connectors", "/connectors/mcp"]) {
  await page.goto("http://127.0.0.1:4310" + r, { waitUntil: "networkidle0" })
  await new Promise((s) => setTimeout(s, 600))
  const btns = await page.evaluate(() => [...document.querySelectorAll("main button, main a[role=button], main a[data-slot=button]")].map((b) => b.textContent.trim()).filter(Boolean))
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  console.log(r, "height", h, "|", btns.join(" · "))
  await page.screenshot({ path: path.join(OUT, (r.replace(/\//g, "_") || "_root") + ".png"), fullPage: true })
}
await browser.close()
