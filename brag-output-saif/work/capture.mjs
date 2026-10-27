// Captures real CAUSASEAL pages (served on :4310) as device-screen stills.
// Usage: node capture.mjs <puppeteer-core dir>
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.argv[2], "_"))
const puppeteer = require("puppeteer-core")
const BASE = "http://127.0.0.1:4310"
const OUT = path.join(here, "screens")
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
})

async function shoot(route, name, { width, height, dpr, mobile = false, action } = {}) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile })
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }])
  await page.goto(BASE + route, { waitUntil: "networkidle0" })
  await page.evaluate(() => document.fonts.ready)
  if (action) await action(page)
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })
  await page.close()
  console.log("ok", name)
}

async function clickText(page, text) {
  const clicked = await page.evaluate((t) => {
    const el = [...document.querySelectorAll("button")].find((b) => b.textContent.includes(t))
    if (el) el.click()
    return Boolean(el)
  }, text)
  if (!clicked) console.warn("button not found:", text)
  await new Promise((r) => setTimeout(r, 4000))
}

const desk = { width: 1440, height: 900, dpr: 2 }
const phone = { width: 390, height: 844, dpr: 3, mobile: true }

await shoot("/", "overview", desk)
await shoot("/investigate", "investigate", desk)
await shoot("/memory", "memory", desk)
await shoot("/lab", "lab", desk)
await shoot("/impact", "impact", desk)
await shoot("/architecture", "architecture", desk)
await shoot("/architecture", "architecture-compare", {
  ...desk,
  action: (p) => clickText(p, "مقارنة الهارنس"),
})
await shoot("/monitor", "monitor", desk)
await shoot("/reports", "reports", desk)
await shoot("/connectors", "connectors", desk)
await shoot("/connectors", "connectors-phone", phone)
await shoot("/monitor", "monitor-phone", phone)

await browser.close()
