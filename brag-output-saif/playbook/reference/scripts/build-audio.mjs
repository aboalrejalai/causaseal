// Builds the 90s soundtrack: synthesized threat bed (0–21s), silence on the freeze,
// riser into the seal impact (22.48s), bundled brag music bed, SFX synced to the timeline.
import { spawnSync } from "node:child_process"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
// MAP=1: place everything on the stretched output timeline and write an un-normalized bed for the voice mix.
const MAPPED = process.env.MAP === "1"
const { tToU, U_END } = await import("./timemap.mjs")
const M = (t) => (MAPPED ? tToU(t) : t)
const END = MAPPED ? U_END : 90
const A = path.join(os.homedir(), ".claude/skills/brag/assets")
const S = (f) => path.join(A, "sfx", f)
const MUSIC = path.join(A, "music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3")

/** [file, time(s), volume] */
const sfx = []
const add = (f, t, v) => sfx.push([S(f), M(t), v])

// S1 typing
for (let i = 0; i < 18; i++) add(`keyboard/keypress-${String((i % 24) + 1).padStart(3, "0")}.wav`, 0.9 + i * 0.1, 0.22)
add("casino/card-slide-1.ogg", 3.95, 0.35) // zoom into email
add("interface/glitch_002.ogg", 5.0, 0.5) // injected line lights up
add("interface/click_003.ogg", 5.8, 0.22)
add("casino/card-shove-1.ogg", 9.15, 0.5) // whip pan
add("interface/drop_001.ogg", 9.95, 0.45) // packet pops out
for (const t of [10.35, 10.65, 10.95]) add("impact/footstep_concrete_001.ogg", t, 0.22)
add("ui/rollover1.ogg", 11.3, 0.35) // clipboard
for (const [i, t] of [11.95, 12.3, 12.65].entries()) add(`interface/click_00${i + 1}.ogg`, t, 0.3)
add("interface/error_005.ogg", 12.95, 0.3) // not in list
add("impact/impactWood_heavy_000.ogg", 13.5, 0.8) // ALLOW stamp
add("interface/click_003.ogg", 15.9, 0.2)
add("interface/click_003.ogg", 17.6, 0.2)
for (let i = 0; i < 8; i++) add(`impact/footstep_concrete_00${i % 5}.ogg`, 16.2 + i * 0.55, 0.2 * (1 - i / 10))
add("impact/impactPunch_heavy_000.ogg", 22.48, 1.0) // seal impact
add("impact/impactBell_heavy_000.ogg", 22.5, 0.3)
add("interface/bong_001.ogg", 23.7, 0.4) // logo
add("casino/card-slide-2.ogg", 30.7, 0.35) // laptop in
for (const t of [32.6, 33.35, 34.1, 34.85]) add("ui/click2.ogg", t, 0.35)
for (const t of [35.6, 35.9, 36.2]) add("interface/switch_002.ogg", t, 0.22)
add("casino/card-slide-3.ogg", 38.8, 0.3)
add("ui/rollover2.ogg", 40.2, 0.25)
add("casino/card-slide-4.ogg", 40.9, 0.3)
add("interface/select_008.ogg", 41.8, 0.3)
add("impact/impactWood_heavy_001.ogg", 43.3, 0.8) // INTERVENE
add("impact/impactPunch_medium_000.ogg", 43.3, 0.35)
add("casino/card-slide-5.ogg", 47.2, 0.28)
add("ui/rollover4.ogg", 47.9, 0.2)
add("interface/switch_004.ogg", 49.0, 0.28)
add("impact/impactGlass_light_001.ogg", 49.85, 0.5) // snip
add("interface/switch_006.ogg", 49.85, 0.35)
add("casino/card-place-1.ogg", 50.8, 0.35)
add("casino/card-place-2.ogg", 51.2, 0.35)
for (const t of [51.8, 51.98, 52.16]) add("interface/click_004.ogg", t, 0.2)
add("interface/bong_001.ogg", 52.9, 0.38) // delivered redacted
add("ui/rollover5.ogg", 57.5, 0.25)
for (const [i, t] of [58.3, 60.4, 62.5, 64.6].entries()) add(`impact/impactWood_medium_00${i}.ogg`, t, 0.5)
for (const t of [59.6, 61.7, 63.8]) add("ui/rollover2.ogg", t, 0.2)
add("casino/card-slide-6.ogg", 66.9, 0.32)
add("ui/mouseclick1.ogg", 68.45, 0.6)
for (const t of [69.0, 69.45, 69.9, 70.35]) add("interface/click_003.ogg", t, 0.28)
add("interface/switch_005.ogg", 71.0, 0.28)
add("interface/switch_007.ogg", 74.6, 0.28)
add("casino/card-slide-7.ogg", 78.6, 0.32)
add("casino/card-slide-8.ogg", 78.9, 0.28)
for (const t of [80.3, 80.8, 81.3]) add("interface/switch_001.ogg", t, 0.32)
add("casino/card-fan-1.ogg", 83.2, 0.32)
add("casino/card-shove-2.ogg", 85.4, 0.28)
add("impact/impactBell_heavy_003.ogg", 85.9, 0.3)
add("interface/bong_001.ogg", 86.0, 0.32)
for (const t of [86.3, 86.45, 86.6]) add("interface/drop_002.ogg", t, 0.22)

// Synth: low drone + heartbeat thump that tightens after the injection (5s).
const beat = (per) => `0.5*sin(2*PI*48*mod(t,${per}))*exp(-10*mod(t,${per}))`
const bed = `0.16*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.25*t))+0.09*sin(2*PI*82.4*t)+0.05*sin(2*PI*110*t)*sin(2*PI*0.5*t)+if(lt(t,5),${beat(1.25)},${beat(0.85)})`
const riser = `0.28*(t/1.08)*(t/1.08)*sin(2*PI*(180*t+520*t*t))`

const args = ["-v", "error", "-y",
  "-f", "lavfi", "-t", String(M(21.2).toFixed(3)), "-i", `aevalsrc=exprs='${bed}':s=48000`,
  "-f", "lavfi", "-t", "1.08", "-i", `aevalsrc=exprs='${riser}':s=48000`,
  "-i", MUSIC]
for (const [f] of sfx) args.push("-i", f)

const parts = [
  `[0:a]lowpass=f=900,afade=t=in:d=1.5,afade=t=out:st=${M(20.4).toFixed(3)}:d=0.6,volume=0.55,aformat=channel_layouts=stereo[bed]`,
  `[1:a]highpass=f=150,adelay=${Math.round((M(22.48) - 1.08) * 1000)}|${Math.round((M(22.48) - 1.08) * 1000)},aformat=channel_layouts=stereo[ris]`,
  `[2:a]atrim=0:${(END - M(22.45)).toFixed(2)},asetpts=PTS-STARTPTS,afade=t=in:d=0.5,afade=t=out:st=${(END - M(22.45) - 3).toFixed(2)}:d=3,volume=0.5,adelay=${Math.round(M(22.45) * 1000)}|${Math.round(M(22.45) * 1000)},aformat=channel_layouts=stereo[mus]`,
]
const labels = ["[bed]", "[ris]", "[mus]"]
sfx.forEach(([, t, v], i) => {
  const ms = Math.round(t * 1000)
  parts.push(`[${i + 3}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${v},adelay=${ms}|${ms}[s${i}]`)
  labels.push(`[s${i}]`)
})
parts.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,atrim=0:${END},apad=whole_dur=${END}${MAPPED ? "" : ",loudnorm=I=-15:TP=-1.5:LRA=11"}[out]`)
args.push("-filter_complex", parts.join(";"), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", path.join(here, MAPPED ? "bed-mapped.wav" : "soundtrack.wav"))

const r = spawnSync("ffmpeg", args, { stdio: "inherit" })
if (r.status !== 0) process.exit(r.status)
console.log(MAPPED ? "bed-mapped.wav" : "soundtrack.wav", "written,", sfx.length, "sfx cues")
