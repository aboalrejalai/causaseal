// Narration placement on the output timeline (shared by mix-voice and captions).
import { tToU } from "./timemap.mjs"

export const TEMPO = 1.12

// Start times on the output timeline (u). Anchors: word offsets measured with silencedetect, divided by TEMPO.
export const place = {
  s01: 0.2,
  s02: 4.45,
  s03: tToU(13.5) + 0.3 - 5.84 / TEMPO, // "فيسمح" lands on the ALLOW stamp
  s04: 16.5,
  s05: 24.5,
  s06: tToU(31.0),
  s07: tToU(43.3) - 6.46 / TEMPO, // "فيتدخّل" lands on the INTERVENE stamp
  s08: tToU(49.85) - 2.1 / TEMPO + 0.05, // "يقطع" lands on the snip
  s09: tToU(57.2),
  s10: tToU(71.0) - 4.78 / TEMPO, // "حيث سمح الهارنس" lands on the row-1 spotlight
  s11: tToU(78.9),
  s12: tToU(85.9) + 0.3,
}

