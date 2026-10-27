// 1) Renders three story stills from the video composition (headlines hidden).
// 2) Renders every SAIF image from images-src/images.html at 3840×2160 (PNG) + a JPG for the platform hero.
// Usage: node build-images.mjs <puppeteer dir>
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.argv[2], "_"))
const puppeteer = require("puppeteer-core")
const root = path.resolve(here, "..")
const OUT = path.join(root, "images"); fs.mkdirSync(OUT, { recursive: true })
const STILLS = path.join(here, "stills-en"); fs.mkdirSync(STILLS, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--allow-file-access-from-files"],
})
const page = await browser.newPage()
page.on("pageerror", (e) => console.error("PAGE ERROR", e.message))

// story stills
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(path.join(root, "composition/index.html")).href, { waitUntil: "load" })
await page.evaluate(() => document.fonts.ready)
for (const [name, t] of [["allow", 14.6], ["match", 44.6], ["cut", 54.5]]) {
  await page.evaluate((tt) => { window.render(tt); for (const id of ["h4", "h7", "h8"]) document.getElementById(id).style.visibility = "hidden" }, t)
  await page.screenshot({ path: path.join(STILLS, `${name}.jpg`), type: "jpeg", quality: 95 })
}

// images at 2× (3840×2160)
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
const list = [["00-prototype-hero", "hero"], ["01-how-it-works", "how"], ["02-harness-compare", "compare"], ["03-honest-architecture", "architecture"],
  ["04-mutation-lab", "lab"], ["05-redacted-delivery", "impact"], ["06-live-monitor", "monitor"], ["07-fingerprint-memory", "memory"], ["08-connectors", "connectors"]]
for (const [file, id] of list) {
  await page.goto(pathToFileURL(path.join(root, "images-src/images.html")).href + `?i=${id}`, { waitUntil: "load" })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
  const png = path.join(OUT, `${file}.png`)
  await page.screenshot({ path: png })
  console.log("ok", file)
}
await browser.close()

// platform upload: JPG ≤ 10 MB
spawnSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(OUT, "00-prototype-hero.png"), "-q:v", "2", path.join(OUT, "00-prototype-hero.jpg")])
for (const f of fs.readdirSync(OUT)) console.log(f, (fs.statSync(path.join(OUT, f)).size / 1e6).toFixed(2), "MB")
