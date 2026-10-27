// Generates narration clips via OpenRouter /audio/speech (Gemini 3.8 Flash TTS).
// Usage: node tts.mjs <jobs.json> <outDir>
// Output: <outDir>/<id>.wav
// jobs.json: [{ "id": "s05", "voice": "Charon", "text": "..." }, ...]
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

// Key: $OPENROUTER_API_KEY, else ~/.config/openrouter/key (chmod 600). Never commit or paste it.
const key = (process.env.OPENROUTER_API_KEY || fs.readFileSync(path.join(os.homedir(), ".config/openrouter/key"), "utf8")).trim()
const [jobsFile, outDir] = process.argv.slice(2)
const jobs = JSON.parse(fs.readFileSync(jobsFile, "utf8"))
fs.mkdirSync(outDir, { recursive: true })

const STYLE =
  "Male narrator for a premium cybersecurity product film. Deep, clear, confident voice. " +
  "Calm, measured Modern Standard Arabic delivery like a high-end tech commercial. " +
  "Short natural pauses at ellipses and full stops. No exaggerated emotion, no rushing."

for (const job of jobs) {
  const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.8-flash-tts",
      input: job.text,
      voice: job.voice,
      response_format: "pcm",
      provider: { options: { "google-ai-studio": { speech_metadata: { style: job.style || STYLE } } } },
    }),
  })
  if (!res.ok) {
    console.error(job.id, res.status, (await res.text()).slice(0, 400))
    continue
  }
  // Gemini PCM: 24 kHz, mono, signed 16-bit little-endian
  const pcm = path.join(outDir, `${job.id}.pcm`), file = path.join(outDir, `${job.id}.wav`)
  fs.writeFileSync(pcm, Buffer.from(await res.arrayBuffer()))
  spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, file])
  fs.unlinkSync(pcm)
  console.log("ok", job.id, job.voice, res.headers.get("x-generation-id") || "")
}
