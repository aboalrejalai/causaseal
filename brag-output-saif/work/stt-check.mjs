// QA: transcribes narration clips (OpenRouter Whisper) so pronunciation can be checked against the script.
// Usage: node stt-check.mjs <file.wav> [...]
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

// Key: $OPENROUTER_API_KEY, else ~/.config/openrouter/key (chmod 600). Never commit or paste it.
const key = (process.env.OPENROUTER_API_KEY || fs.readFileSync(path.join(os.homedir(), ".config/openrouter/key"), "utf8")).trim()
let cost = 0
for (const file of process.argv.slice(2)) {
  const res = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/whisper-large-v3",
      input_audio: { data: fs.readFileSync(file).toString("base64"), format: "wav" },
      language: "ar",
    }),
  })
  const j = await res.json()
  cost += Number(j.usage?.cost || 0)
  console.log(path.basename(file), "→", res.ok ? j.text : JSON.stringify(j).slice(0, 300))
}
console.log("stt cost $", cost.toFixed(4))
