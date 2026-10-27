// Drives the real app (English toggle, light theme), runs each page's action, and captures
// full-page previews (preview mode) or the final hi-DPI shots (final mode).
// Usage: node capture-en.mjs <puppeteer dir> preview|final
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.argv[2], "_"))
const puppeteer = require("puppeteer-core")
const FINAL = process.argv[3] === "final"
const OUT = path.join(here, FINAL ? "shots" : "preview-en"); fs.mkdirSync(OUT, { recursive: true })
const BASE = "http://127.0.0.1:4310"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" })
const page = await browser.newPage()
await page.evaluateOnNewDocument(() => { localStorage.setItem("causaseal-language", "en"); localStorage.setItem("theme", "light") })
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: FINAL ? 2 : 1 })

async function go(route) { await page.goto(BASE + route, { waitUntil: "networkidle0" }); await page.evaluate(() => document.fonts.ready); await wait(500) }
async function click(text) {
  const ok = await page.evaluate((t) => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().includes(t)); if (b) b.click(); return !!b }, text)
  if (!ok) console.warn("missing button:", text)
  await wait(3500)
}
async function scrollToText(text, offset = 90) {
  await page.evaluate((t, off) => {
    const el = [...document.querySelectorAll("main h1,main h2,main h3,main [data-slot=card-title],main div")].find((e) => e.childElementCount < 3 && e.textContent.trim().startsWith(t))
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off)
  }, text, offset)
  await wait(400)
}
async function shot(name, { full = !FINAL } = {}) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full })
  console.log("ok", name)
}
async function cardShot(name, heading) {
  const handle = await page.evaluateHandle((t) => {
    const h = [...document.querySelectorAll("main *")].find((e) => e.childElementCount === 0 && e.textContent.trim() === t)
    let el = h
    while (el && !(el.getAttribute("data-slot") === "card")) el = el.parentElement
    return el || h
  }, heading)
  const el = handle.asElement()
  if (!el) return console.warn("missing card:", heading)
  await el.screenshot({ path: path.join(OUT, `${name}.png`) })
  console.log("ok", name)
}

if (!FINAL) {
// Architecture: map + harness compare
await go("/architecture"); await shot("arch-map")
await click("Run harness compare"); await wait(1500)
await scrollToText("Harness compare (four cases)", 40); await shot("arch-compare")
await go("/investigate"); await click("عرض SAIF"); await click("تشغيل التحليل السببي"); await shot("investigate")
await go("/memory"); await shot("memory")
await go("/lab"); await click("توليد واختبار الطفرات"); await wait(2000); await shot("lab")
await go("/impact"); await click("تشغيل سيناريوهات الفرق"); await wait(1500); await shot("impact")
await go("/monitor"); await click("وكيل يحاول التسريب"); await click("وكيل مشروع"); await click("وكيل يحاول التسريب"); await shot("monitor")
await go("/connectors/mcp"); await shot("connector-mcp")
} else {
await go("/architecture"); await shot("arch-map")
await click("Run harness compare"); await wait(1500); await cardShot("compare-card", "Harness compare (four cases)")
await go("/memory"); await shot("memory")
await go("/lab"); await click("توليد واختبار الطفرات"); await wait(2000); await cardShot("lab-results", "نتائج المحاكاة")
await go("/impact"); await click("تشغيل سيناريوهات الفرق"); await wait(1500); await cardShot("impact-runs", "تشغيل الوكيل")
await go("/monitor"); await click("وكيل يحاول التسريب"); await click("وكيل مشروع"); await click("وكيل يحاول التسريب")
await scrollToText("محاكي بوابة التشغيل", 30); await shot("monitor")
await go("/connectors/mcp"); await shot("connector-mcp")
}
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
await go("/connectors"); await shot("phone-connectors", { full: false })
await browser.close()
