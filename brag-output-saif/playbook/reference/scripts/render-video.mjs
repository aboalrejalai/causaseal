// Renders composition/index.html frame by frame (render(t) is a pure function of time).
// Stills:  node render-video.mjs <puppeteer dir> stills 2.5 6 13.8 ...
// Video:   node render-video.mjs <puppeteer dir> video [start] [end]
// Mapped:  node render-video.mjs <puppeteer dir> videomap   (output time u → composition time t via timemap.json)
import fs from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.argv[2], "_"))
const puppeteer = require("puppeteer-core")
const mode = process.argv[3]
const VERT = mode === "vertical" || mode === "vstills"
const FPS = 30
const comp = pathToFileURL(path.resolve(here, "../composition/index.html")).href

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--allow-file-access-from-files", "--force-color-profile=srgb", "--hide-scrollbars"],
})
const page = await browser.newPage()
page.on("pageerror", (e) => console.error("PAGE ERROR", e.message))
await page.setViewport(VERT ? { width: 1080, height: 1920, deviceScaleFactor: 1 } : { width: 1920, height: 1080, deviceScaleFactor: 1 })
await page.goto(comp + (VERT ? "?layout=vertical" : ""), { waitUntil: "load" })
if (VERT) await page.evaluate((c) => window.setCaptions(c), JSON.parse(fs.readFileSync(path.join(here, "captions.json"), "utf8")))
await page.evaluate(() => document.fonts.ready)
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))

async function frame(t, u) {
  await page.evaluate((tt, uu) => window.render(tt, uu), t, u ?? null)
  return page.screenshot({ type: "jpeg", quality: 94, optimizeForSpeed: true })
}

if (mode === "stills") {
  const dir = path.join(here, "stills")
  fs.mkdirSync(dir, { recursive: true })
  for (const s of process.argv.slice(4)) {
    const t = parseFloat(s)
    fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(6, "0")}.jpg`), await frame(t))
  }
  console.log("stills written to", dir)
} else if (mode === "vstills") {
  // output-time stills for the vertical cut: node render-video.mjs <dir> vstills 3 12 ...
  const { uToT } = await import("./timemap.mjs")
  const dir = path.join(here, "vstills")
  fs.mkdirSync(dir, { recursive: true })
  for (const s of process.argv.slice(4)) {
    const u = parseFloat(s)
    fs.writeFileSync(path.join(dir, `u${u.toFixed(2).padStart(6, "0")}.jpg`), await frame(uToT(u), u))
  }
  console.log("vertical stills written to", dir)
} else if (mode === "videomap" || mode === "vertical") {
  const { uToT, U_END } = await import("./timemap.mjs")
  const out = path.join(here, VERT ? "video-vertical.mp4" : "video-mapped.mp4")
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), out], { stdio: ["pipe", "inherit", "inherit"] })
  const total = Math.round(U_END * FPS)
  for (let i = 0; i < total; i++) {
    const buf = await frame(uToT(i / FPS), i / FPS)
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r))
    if (i % 300 === 0) console.log(`frame ${i}/${total}`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on("close", r))
  console.log("video:", out)
} else {
  const start = parseFloat(process.argv[4] ?? "0"), end = parseFloat(process.argv[5] ?? "90")
  const out = path.join(here, `video-${start}-${end}.mp4`)
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), out], { stdio: ["pipe", "inherit", "inherit"] })
  const total = Math.round((end - start) * FPS)
  const t0 = Date.now()
  for (let i = 0; i < total; i++) {
    const buf = await frame(start + i / FPS)
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r))
    if (i % 150 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on("close", r))
  console.log("video:", out)
}
await browser.close()
