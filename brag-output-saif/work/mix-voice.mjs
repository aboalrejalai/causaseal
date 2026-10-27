// Places the 12 narration lines on the stretched timeline, processes the voice,
// ducks the music/SFX bed under it, and writes soundtrack-voice.wav.
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { U_END } from "./timemap.mjs"
import { TEMPO, place } from "./voice-plan.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const V = (id) => path.join(here, "voice/final", `${id}.wav`)

const ids = Object.keys(place)
const args = ["-v", "error", "-y", "-i", path.join(here, "bed-mapped.wav")]
ids.forEach((id) => args.push("-i", V(id)))
const parts = ids.map((id, i) => {
  const ms = Math.round(place[id] * 1000)
  return `[${i + 1}:a]atempo=${TEMPO},aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`
})
parts.push(
  `${ids.map((_, i) => `[v${i}]`).join("")}amix=inputs=${ids.length}:normalize=0,apad=whole_dur=${U_END},atrim=0:${U_END},` +
    "highpass=f=85,equalizer=f=3000:t=q:w=1.2:g=2.5,equalizer=f=250:t=q:w=1:g=-2," +
    "acompressor=threshold=0.1:ratio=3:attack=8:release=160:makeup=2,volume=1.6,asplit=2[voice][key]",
  "[0:a]volume=1.15[bed]",
  "[bed][key]sidechaincompress=threshold=0.03:ratio=8:attack=25:release=450:makeup=1[ducked]",
  `[ducked][voice]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,apad=whole_dur=${U_END},atrim=0:${U_END}[out]`,
)
args.push("-filter_complex", parts.join(";"), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", path.join(here, "soundtrack-voice.wav"))
const r = spawnSync("ffmpeg", args, { stdio: "inherit" })
if (r.status !== 0) process.exit(r.status)
for (const id of ids) console.log(id, place[id].toFixed(2))
console.log("soundtrack-voice.wav written")
