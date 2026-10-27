// Renders style-frame HTML files in src/ to 1920×1080 PNGs next to this script.
// Usage: node render.mjs <puppeteer-core node_modules dir> [frame names...]
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.argv[2], "_"))
const puppeteer = require("puppeteer-core")
const src = path.join(here, "src")
const wanted = process.argv.slice(3)
const files = fs
  .readdirSync(src)
  .filter((f) => f.endsWith(".html"))
  .filter((f) => !wanted.length || wanted.includes(f.replace(".html", "")))

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--allow-file-access-from-files"],
})
for (const file of files) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(path.join(src, file)).href, { waitUntil: "load" })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
  await page.screenshot({ path: path.join(here, file.replace(".html", ".png")) })
  await page.close()
  console.log("rendered", file)
}
await browser.close()
