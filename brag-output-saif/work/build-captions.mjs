// Burned-in caption timing for the vertical cut: each narration line is split at punctuation and
// aligned to the real pauses in its audio (silencedetect), then placed on the output timeline.
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { TEMPO, place } from "./voice-plan.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const script = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(here, "script-Iapetus.json"), "utf8")).map((j) => [j.id, j.text]))
script.s05 = "إلا إذا كان هناك من يتذكّر. كوزاسيل… يحفظ سبب الحادثة، لا كلماتها."

const display = (s) =>
  s.replace(/[ً-ْ]/g, "") // drop harakat for on-screen reading
    .replace(/كوزا ?سيل/g, "CAUSASEAL")
    .replace("إتش تي تي بي، إم سي بي، وإس دي كي", "HTTP وMCP وSDK")

function speechSegments(file) {
  const log = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"], { encoding: "utf8" }).stderr
  const dur = parseFloat(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout)
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1])
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1])
  const segs = []
  let cur = 0
  starts.forEach((s, i) => { if (s > cur) segs.push([cur, s]); cur = ends[i] ?? dur })
  if (cur < dur) segs.push([cur, dur])
  return segs
}

const caps = []
for (const [id, start] of Object.entries(place)) {
  const text = display(script[id])
  const chunks = text.split(/(?<=[…،.:])\s+/).filter(Boolean)
  const segs = speechSegments(path.join(here, "voice/final", `${id}.wav`))
  let times
  if (segs.length === chunks.length) times = segs
  else {
    // proportional by characters across the spoken span
    const total = chunks.reduce((n, c) => n + c.length, 0)
    const [a0, b0] = [segs[0][0], segs[segs.length - 1][1]]
    let acc = 0
    times = chunks.map((c) => { const a = a0 + ((b0 - a0) * acc) / total; acc += c.length; return [a, a0 + ((b0 - a0) * acc) / total] })
  }
  const line = chunks.map((c, i) => ({
    a: start + times[i][0] / TEMPO - 0.05,
    b: i + 1 < chunks.length ? start + times[i + 1][0] / TEMPO - 0.05 : start + times[i][1] / TEMPO + 0.35,
    text: c,
  }))
  // merge flashes shorter than 0.7s into the following chunk of the same line
  for (let i = 0; i < line.length - 1; i++) {
    if (line[i].b - line[i].a < 0.7) { line[i + 1] = { a: line[i].a, b: line[i + 1].b, text: `${line[i].text} ${line[i + 1].text}` }; line.splice(i, 1); i-- }
  }
  line.forEach((c) => caps.push({ a: +c.a.toFixed(3), b: +c.b.toFixed(3), text: c.text }))
}
fs.writeFileSync(path.join(here, "captions.json"), JSON.stringify(caps, null, 1))
console.log(caps.length, "captions"); caps.forEach((c) => console.log(c.a.toFixed(2), c.b.toFixed(2), c.text))
