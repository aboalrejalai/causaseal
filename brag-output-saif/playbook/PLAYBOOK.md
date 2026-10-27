# Product Launch Media Playbook
### Motion-graphics video · Arabic voiceover · vertical cut · professional product images

This file is the complete, self-contained method used to produce the CAUSASEAL SAIF 2026 media
(September 2026). Hand it to any coding agent (Claude Code or another) inside a new project, together
with the `reference/` folder next to it, and it has everything needed to produce the same class of
result for that project. Nothing here depends on memory of the original conversation.

---

## 0. What was produced and what it cost

| Deliverable | Spec |
|---|---|
| Landscape video, no voice | 1920×1080, 30 fps, 90 s, H.264 + AAC, 12.5 MB |
| Landscape video, Arabic voiceover | 1920×1080, 30 fps, 94 s, 13 MB |
| Vertical video (TikTok / X / Reels), voice + burned-in Arabic captions | 1080×1920, 30 fps, 94 s, 9.6 MB |
| Poster frames (baked as frame 0 of each video) | JPG |
| 9 product images for the competition (English) | 3840×2160 PNG + one ≤10 MB JPG for the platform upload |

- Total paid spend: **$0.068** on OpenRouter (all TTS takes, retakes and Whisper QA). Everything else is free, local software.
- Render time: ~110 s for 2,700 frames at 1080p on an Apple-silicon Mac; ~2.5 min for the vertical cut.

---

## 1. Honest breakdown: where every piece came from

| Piece | Source | Notes |
|---|---|---|
| Creative method (hook first, "show the real thing", readability ≈0.3 s/word, check stills and mid-transition frames, poster as frame 0, no invented claims) | **`brag` skill** by latent-spaces, `github.com/latent-spaces/brag`, commit `c893c5e` (2026-09-24), files `skills/brag/SKILL.md` and `skills/brag-slim/SKILL.md` | Used as the quality contract, not as a generator. brag's 15–25 s length rule was deliberately **overridden**: a competition explainer needs ~90 s. |
| Music | brag bundled track `assets/music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (ende.app "Happy Beats / Business Moves") | **Licence not verified.** brag's README says to confirm the licence before publishing. Replace it for public YouTube/TikTok if unsure. |
| Sound effects (stamps, clicks, whooshes, keyboard, bong) | brag bundled `assets/sfx/{impact,interface,ui,casino,keyboard}/` | Mostly Kenney-style CC0 packs as shipped in the skill. |
| Threat drone, heartbeat, riser | **Synthesized** with ffmpeg `aevalsrc` (math expressions), no file | See §6.3. |
| Characters (AI agent robot, harness guard, masked data packet, wax-seal mascot) | **Hand-written SVG** by the agent, geometric flat style | No download, no image model. See §5.5 and `reference/composition/characters.js`. |
| Layouts, animation, timeline engine | **Hand-written HTML/CSS/JS**, one page, `render(t)` is a pure function of time | No GSAP, no HyperFrames runtime, no Remotion. ~800 lines. |
| Frame capture | **puppeteer-core 25.12** driving the installed **Google Chrome 153** | puppeteer-core was taken from the npx cache of `hyperframes` (any `npm i puppeteer-core` works). |
| Encoding, mixing, QA measurements | **ffmpeg 9.0.1** (Homebrew build — note: no `drawtext` filter) | |
| Voiceover | **OpenRouter** → `google/gemini-3.8-flash-tts`, voice **Iapetus** | ~$0.0135 per generated minute. |
| Pronunciation QA | **OpenRouter** → `openai/whisper-large-v3` | Fractions of a cent. |
| Product data shown on screen (decisions, fingerprints, table rows) | **The project's own engine**, executed by scripts (`engine-data.mjs`, `lab-variants.mjs`) | Every number/decision on screen is real engine output. |
| Real UI screens | The project's own app, built (`npm run build`) and served locally, captured by puppeteer | |
| Fonts | IBM Plex Sans Arabic (the project's brand font, OTF copied locally) | |
| Web research (TTS options, prices, API formats) | Claude Code built-in `WebSearch` / `WebFetch` | Sources in §11. |

Why the result beat the previous attempts (another model used the same brag skill): it followed
the skill's *instructions* literally (13 page slides, tiny text on white, decoration added on request)
instead of designing a **story**. The skill does not make a video good; the storyboard does.
See §9.

---

## 2. Environment and one-time setup

```bash
node -v                 # >= 20; used 26.8.1
ffmpeg -version         # any recent build; used 9.0.1
ls "/Applications/Google Chrome.app"   # or pass another Chromium path to puppeteer
mkdir -p ~/media-tools && cd ~/media-tools && npm init -y && npm i puppeteer-core
```

Scripts in `reference/scripts` take the puppeteer install directory as their first argument
(`node render-video.mjs ~/media-tools/node_modules video`), because the original run borrowed it from
the npx cache. In a new project either keep that convention or replace the `createRequire(...)` line
with a normal `import puppeteer from "puppeteer-core"`.

### Secrets (OpenRouter key)

- Stored once per machine at `~/.config/openrouter/key`, `chmod 600`, directory `chmod 700`.
- Scripts read `$OPENROUTER_API_KEY` first, else that file. Every project on the machine reuses it.
- Never paste the key into chat, never write it inside the repo. To store it without it appearing
  in shell history:

```bash
mkdir -p ~/.config/openrouter && chmod 700 ~/.config/openrouter
read -s "k?Paste OpenRouter key: " && print -r -- "$k" > ~/.config/openrouter/key && chmod 600 ~/.config/openrouter/key && unset k
```

(zsh syntax; in bash use `read -s -p "Paste key: " k`.) Verify without printing it:
`curl -s -o /dev/null -w "%{http_code}\n" https://openrouter.ai/api/v1/key -H "Authorization: Bearer $(cat ~/.config/openrouter/key)"` → `200`.

---

## 3. The workflow at a glance

```
1 Discover  → read the code, run the real engine, capture real screens
2 Story     → one hero object's journey, one visual metaphor, 8 acts, 12 shots, timed
3 Style     → 8 still "style frames" at final quality (catch design problems before animating)
4 Animate   → one HTML page, render(t) pure function, tiny tween lib, SVG characters
5 Render    → puppeteer screenshot per frame → pipe to ffmpeg (no intermediate PNGs)
6 QA        → stills per shot + mid-transition stills + automatic blank-frame detector
7 Sound     → synthesized threat bed + SFX on cues + music bed + loudness normalisation
8 Voice     → script → TTS per line → Whisper QA → trim → time-map the picture → duck music
9 Vertical  → same page, ?layout=vertical wrapper, captions from real speech pauses
10 Images   → drive the real app, hi-DPI captures, English layout template, 4K export
11 Deliver  → poster baked as frame 0, faststart MP4, share copy
```

---

## 4. Discovery and story (the part that decides quality)

### 4.1 Discovery
1. Read README / AGENTS.md / docs; list every product claim that is actually proven.
2. **Run the product's engine** with the exact scenario the video will show and save JSON
   (`reference/scripts/engine-data.mjs`). Use an isolated state file (the CAUSASEAL engine honours
   `CAUSASEAL_STATE_PATH`) so the repo's data is untouched.
3. Build and serve the app, capture every page at 1440×900 @2× (`reference/scripts/capture.mjs`).
   Pages showing illustrative percentages must not appear in the video as claims.

### 4.2 Pick the genre and length
- Social "launch clip": 15–25 s (brag default).
- Competition / investor explainer for a complex product: **75–95 s**. Judges need time to follow;
  a judge's rule of thumb from hackathons: *"sell me the product, don't read to me."*

### 4.3 Structure that sells (used here, 90 s)
| Act | Time | Job |
|---|---|---|
| 1 Hook | 0–8 | The victim doing something normal; the threat appears in one line |
| 2 Problem | 8–22 | Why today's defence fails — shown with a metaphor, ends on a **freeze frame + silence** |
| 3 Reveal | 22–30 | Mascot lands, world flips dark → light (radial wipe), logo + tagline |
| 4 How | 30–56 | Inside the real app: reconstruct → match → minimal intervention |
| 5 Robustness | 56–66 | Same attack reworded 4 ways (incl. another language) → same decision |
| 6 Proof | 66–78 | The real results table, spotlight row by row |
| 7 Integrates anywhere | 78–85 | Laptop + phone, connectors snap in |
| 8 Sign-off | 85–90 | Tagline, URL, event, 3-second hold |

### 4.4 One visual metaphor that explains the invention in two seconds
CAUSASEAL: *the harness is a guard with a list of tool names; the attack wears a mask and a fake name
badge (`post_update`) so the guard says ALLOW; CAUSASEAL doesn't look at the face, it recognises the
**shape** (silhouette) of a past incident.* The metaphor is technically exact (the harness really
checks tool names against a set). Find the equivalent for each new product: what does the old
defence look at, what does yours look at instead?

### 4.5 Rules
- One **hero object** travels through the whole film (here: a "customer data" document). Pages of the
  app are *stations* on its journey, never a slide tour.
- Every on-screen number/decision comes from the engine. No percentages that were not measured.
- Choose the scenario that is the **core** of the product, not a side demo. (A health-care sim existed
  in the repo; using it was rejected by the owner — the product is cybersecurity.)
- Dark world for the threat, brand-light world for the solution; the switch is the emotional climax.

The full CAUSASEAL storyboard is in `reference/storyboard-causaseal.md`.

---

## 5. The animation engine (reference/composition/index.html)

### 5.1 Architecture
- One HTML page, fixed 1920×1080 `.stage`, RTL for Arabic.
- Three layers: `#night` (acts 1–2), `#day` (acts 3–8, revealed through `clip-path: circle()`),
  `#top` (the mascot crossing layers).
- Each shot is a `.scene` div; `render(t)` shows/hides scenes with `display` (performance) and sets
  every transform/opacity **from t alone**. No state carried between frames → any frame can be
  rendered in any order, seeks are exact, re-renders are reproducible.

### 5.2 The whole tween library
```js
const E = { lin: x => x, in2: x => x*x, out3: x => 1 - (1-x)**3,
  io3: x => x < .5 ? 4*x*x*x : 1 - (-2*x+2)**3/2,
  back: x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3*(x-1)**3 + c1*(x-1)**2 } }
const p = (t, a, b, e = E.out3) => t <= a ? 0 : t >= b ? 1 : e((t - a) / (b - a))   // 0→1 progress
const L = (a, b, k) => a + (b - a) * k                                              // lerp
const env = (t, a, b, c, d) => Math.min(p(t, a, b), 1 - p(t, c, d, E.in2))          // in then out
function T(el, o) { el.style.transform = `translate(${o.x||0}px,${o.y||0}px) rotate(${o.r||0}deg) scale(${o.sx??o.s??1},${o.sy??o.s??1})`
  if (o.o !== undefined) el.style.opacity = o.o }
```
Word-by-word text: split a line into `<span class="w">` and stagger opacity + translateY.
Typewriter: `text.slice(0, n(t))`. Stroke draw: SVG `pathLength="1"` + `stroke-dasharray: k 1`.

### 5.3 Motion vocabulary used (name → where)
| Technique | Use |
|---|---|
| Slow push-in | opening chat scene |
| Punch-in / zoom-through | laptop screen grows into the email document |
| Glow pulse | the injected line lights up red |
| Whip pan with motion blur | act 1 → act 2 (`filter: blur()` peaking mid-move) |
| Tracking + walk bob | the packet walks to the gate (abs(sin) bob, ±3° tilt) |
| Stamp slam with overshoot | ALLOW / INTERVENE (`scale 2.4→1`, back ease, 0.2 s) + camera shake |
| Ramp to slow-mo → freeze frame | end of act 2, desaturated with `grayscale()`, audio cut to silence |
| Squash & stretch, anticipation | mascot falls (stretched), lands (squashed), recovers (back ease) |
| Radial wipe | dark → light world from the impact point |
| Match cut | mascot circle → laptop; path shape → fingerprint shape |
| Morph / overlay | current path triangle slides into the stored fingerprint quad |
| Snip + flash + split | the named cut; original locks & greys, redacted copy continues |
| Text swap | four reworded attacks, same silhouette, beat-synced stamps |
| Cursor sim + click | "Run harness compare" button |
| Spotlight (dim the rest to 32 %) | table rows |
| Parallax slide / snap-in | laptop left, phone right, connector chips |
| Idle breathing | every character `scaleY(1 ± 0.015·sin)` so nothing is ever frozen |
| Overlap / stagger transitions | old content out, then new content in — never a muddy double exposure, never an empty frame |

### 5.4 Readability rules (1080p)
Titles 96–120 px, main lines 64–72 px, smallest readable text 40 px; devices fill 70–85 % of the
frame; 80 px safe margin; every line fully visible ≥ 0.3 s per word after it settles.

### 5.5 Characters
Flat geometric SVG, 6 px ink outline (`#0d121c`), brand palette only, soft ellipse shadow.
Each is a function returning an SVG string with **named parts** so the page can animate them:
- `agent({eyes: normal|spiral|happy, wave, night})` — robot; `.eyes`, `.arm-r`, `.legs`.
- `guard({mood, tip, night})` — cap, star badge, clipboard of tool names.
- `intruder({badge, grey, night})` — document "customer data" with bandit mask, blurred fields
  (SVG `feGaussianBlur`), lanyard badge showing the fake tool name.
- `seal({mood: calm|focus|happy})` — wax seal (generated star polygon, 18 bumps), dashed inner ring, eyes.
States swap by replacing innerHTML only when the state key changes (`charSet(el, key, html)`).
Night variants lighten legs so silhouettes read on dark backgrounds.

### 5.6 Style frames first
Before any animation, 8 key moments were built as static HTML (`reference/style-frames/`) and
rendered to PNG. Problems caught there cost minutes instead of re-renders (empty half-frames,
callouts covering a character, stamp overlapping a label, wave arm crossing the face).

---

## 6. Rendering, QA, sound

### 6.1 Frame-accurate render (reference/scripts/render-video.mjs)
puppeteer opens the page, waits for `document.fonts.ready` and all images to decode, then for each
frame: `page.evaluate(t => render(t))` → `page.screenshot({type:"jpeg", quality:94, optimizeForSpeed:true})`
→ written to ffmpeg's stdin:
```
ffmpeg -f image2pipe -framerate 30 -c:v mjpeg -i - -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p out.mp4
```
Modes: `stills t1 t2 …`, `video [start] [end]`, `videomap` (time-mapped, §7.4), `vertical`, `vstills`.

### 6.2 QA gates (all automated except looking)
1. Contact sheet of stills every 2 s (`ffmpeg … tile=4x4`). Beware: `tile` of mis-sized inputs can
   fake a "shifting layout"; confirm suspicious frames at full resolution.
2. Stills at the **middle of every transition** — this is where double exposures hide.
3. Blank-frame detector: sample at 2 fps, 64×36 grey, flag frames with luminance std-dev < 8.
4. `ffprobe` duration / frame count / size; loudness per section with `volumedetect`.
5. Sync check: extract frames at each narration anchor and confirm the visual event.

### 6.3 Sound design (reference/scripts/build-audio.mjs)
- Threat bed, synthesized: `aevalsrc=exprs='…'` — 55 Hz + 82.4 Hz drone with slow tremolo plus a
  heartbeat thump `0.5*sin(2*PI*48*mod(t,P))*exp(-10*mod(t,P))`, period 1.25 s tightening to 0.85 s
  after the threat appears; low-passed at 900 Hz. **Quote the expression** (`exprs='…'`) or ffmpeg's
  filter parser splits on the commas.
- Riser (chirp) into the reveal: `0.28*(t/1.08)^2*sin(2*PI*(180*t+520*t*t))`, high-passed.
- Silence on the freeze frame; impact + bell on the landing; music from the reveal onward.
- ~100 SFX placed with `adelay=ms|ms` and per-cue volume, summed with `amix=normalize=0`.
- Final `loudnorm=I=-15:TP=-1.5:LRA=11` (no voice) / `I=-14` with voice (YouTube/LinkedIn target).

### 6.4 Poster as frame 0 (so every platform thumbnail is the best frame)
Replace, don't prepend (keeps duration and sync): take the settled sign-off frame, then
```
[poster]fps=30,trim=end_frame=1[p];[video]trim=start_frame=1,setpts=PTS-STARTPTS[r];[p][r]concat=n=2:v=1
```
Encode `-crf 18 -preset slow -movflags +faststart`. See `reference/scripts/finalize.sh`.

---

## 7. Arabic voiceover (OpenRouter + Gemini TTS)

### 7.1 Choosing the engine (researched 2026-09-29)
| Option | Arabic quality | Cost for a 90 s video |
|---|---|---|
| **Gemini 3.8 Flash TTS via OpenRouter** (chosen) | #2 in blind listening arena; strong on MSA | ≈ $0.02 per full take |
| Same model in Google AI Studio | same | free tier |
| Azure `ar-SA-HamedNeural` | Saudi male, less expressive | 500 k chars/month free |
| ElevenLabs | excellent | subscription |

### 7.2 Script rules that remove the "academic" sound
- Modern Standard Arabic for a pan-Arab jury, but **stopped word endings** (no case endings) —
  full tashkeel makes it sound like a lecture. Add diacritics only where a word is ambiguous.
- Write brand and acronyms phonetically: `كوزاسيل` (write `كوزا سيل` if a take blurs it),
  `إتش تي تي بي، إم سي بي، وإس دي كي`.
- Narration **complements** the screen, never reads it.
- Budget ≈ 1.3–1.8 words/s at the chosen tempo; ~130 words for 90 s.
- One line per shot; the key word of a line lands on the visual beat (e.g. «فيتدخّل» on the INTERVENE stamp).

### 7.3 Generating (reference/scripts/tts.mjs)
```
POST https://openrouter.ai/api/v1/audio/speech
{ "model": "google/gemini-3.8-flash-tts", "input": "<line>", "voice": "Iapetus",
  "response_format": "pcm",                         // Gemini accepts ONLY pcm here
  "provider": { "options": { "google-ai-studio": { "speech_metadata": { "style": "<director notes>" } } } } }
```
Response = raw PCM **24 kHz, mono, s16le** → `ffmpeg -f s16le -ar 24000 -ac 1 -i x.pcm x.wav`.
Style notes used (English works best): *"Energetic yet controlled Arabic TV commercial voiceover…
Natural conversational storytelling, like a top Gulf advertising narrator. NOT academic, NOT a lecture,
NOT a news reader. Use stopped word endings. Varied intonation…"* plus per-line mood
(threat: lower and tense; solution: confident, a smile in the voice; sign-off: bold with a pause).
Male voices auditioned: Charon, Orus, Iapetus, Alnilam → owner picked **Iapetus**.
Workflow: 1 sentence × 4 voices audition → owner picks by ear → generate each line separately
(so any single line can be retaken).

### 7.4 QA and fitting
1. Whisper each line (`reference/scripts/stt-check.mjs`, `openai/whisper-large-v3`, `language:"ar"`)
   and diff against the script; retake only the lines that drift.
2. Trim silence: `silenceremove=start_periods=1:start_threshold=-45dB…,areverse,…,areverse`.
3. Find word anchors inside a clip with `silencedetect=noise=-35dB:d=0.18`.
4. Speed: `atempo=1.12` (natural up to ~1.15).
5. **Time-map the picture instead of cramming the voice**: `timemap.json` holds knots
   `[compositionTime, outputTime]`; the renderer draws frame `u` at `t = uToT(u)`, and SFX times are
   converted with `tToU`. Stretches only where narration needs room (90 s → 94 s).
6. Placement (`voice-plan.mjs`): `start = tToU(visualBeat) − wordOffset/tempo`.

### 7.5 Mix (reference/scripts/mix-voice.mjs)
Voice chain: `highpass 85 Hz → +2.5 dB @3 kHz → −2 dB @250 Hz → acompressor 3:1`.
Bed ducking: `sidechaincompress=threshold=0.03:ratio=8:attack=25:release=450` keyed by the voice.
Master: `loudnorm=I=-14:TP=-1.5:LRA=9`, then `aresample=48000,apad,atrim` (loudnorm shortens slightly).
Whisper the full mix once to prove the voice cuts through (it may skip short segments after pauses —
re-check those segments alone).

---

## 8. Vertical cut and product images

### 8.1 Vertical 1080×1920 (reference/composition/vertical.js)
Same page with `?layout=vertical`: moves each scene's headline into a top panel (visibility and
opacity copied from its owning scene every frame), scales the 1920×1080 stage to 0.66 in a middle
band (soft `mask-image` fade at the band edges hides the seam), per-scene zoom-out where content hits
the edges, brand line at y≈170, captions at y≈1375 — inside TikTok's safe area (away from the right
button rail and the bottom 20 %). Captions (`build-captions.mjs`): each line split at punctuation,
aligned to real speech segments from `silencedetect`, flashes < 0.7 s merged, diacritics stripped,
brand/acronyms shown in Latin.

### 8.2 Product images (reference/scripts/capture-en.mjs, build-images.mjs, images-src/images.html)
- Competition rule found in the repo docs: platform attachments in **English**; one "prototype image"
  JPG/PNG ≤ 10 MB; other screenshots go to Drive. Always read the event's rules first.
- Capture the real app: `evaluateOnNewDocument` sets the language/theme localStorage keys, click each
  page's real action buttons, wait, then viewport shots at 1440×900 @2× or **element screenshots of
  a single card** (`el.screenshot()`), which read far better than whole pages.
- Layout template at 1920×1080 CSS rendered with `deviceScaleFactor: 2` → 3840×2160:
  left column (number chip, eyebrow, title with one colored phrase, caption, 3–4 proof bullets),
  right: laptop/phone frame (CSS) with the capture, soft brand glow behind; a **wide** variant
  (text on top, card below) for short, wide tables.
- Hero image: headline + laptop + floating proof card + phone + mascot + 3 proof chips.
- "How it works" image: three stills rendered from the video page (headlines hidden) + English steps.
- Keep the Arabic UI as-is; titles and captions in English explain it (an Arabic-first product is a strength).
- Exclude any screen that shows a bug (a `NaN` field was found and excluded) and log it for a fix.
- Bullet lists: wrap `<li>` content in one `<span>` when the `li` is flex, or bold fragments split into columns.

---

## 9. Mistakes to avoid (from the two failed attempts)

1. Treating "cover every page" as "one slide per page" → 13 disconnected slides. Use a journey.
2. Small UI cards floating in a white 1920×1080 canvas → unreadable. Devices fill the frame; punch in.
3. Exiting every element before the cut and entering after it → ~⅓ of sampled frames blank.
4. Adding requested decoration (devices, characters) without giving them a job. Every character must act.
5. Hook that shows a badge nobody understands yet. Open on the victim's normal task.
6. Silent assumption that the skill's default length fits the brief. Ask what the video is for.
7. Picking a side demo (health sim) as the story. Confirm the core domain with the owner.
8. Academic TTS delivery. Stopped endings + commercial style notes.

---

## 10. Reuse checklist — prompt to give an agent in a new project

> Read `PLAYBOOK.md` and the `reference/` folder. Produce for this project:
> (1) a ~90 s Arabic motion-graphics explainer (or the length/language I state), built as a single
> HTML page with a pure `render(t)` and rendered frame-by-frame with puppeteer + ffmpeg;
> (2) an Arabic voiceover with OpenRouter `google/gemini-3.8-flash-tts` (key in
> `~/.config/openrouter/key`), audition 4 male voices first, QA with Whisper, time-map the picture
> to the narration, duck the music; (3) a 1080×1920 vertical cut with burned-in captions;
> (4) product images at 3840×2160 from the real running app.
> Before animating: read the code, run the real engine for every number shown, write a storyboard
> with one hero object and one visual metaphor, and render 8 style frames. Never invent metrics.
> Follow the QA gates in §6.2. Keep all outputs in `media-output/` (not committed).

Per-project inputs to collect first: product one-liner, the single core scenario, what the old
defence/competitor checks vs what yours checks (the metaphor), proven claims list, forbidden claims,
brand colors + font, event rules (length, language, file limits), target platforms.

---

## 11. File map of the reference implementation (`reference/`)

| File | Role |
|---|---|
| `storyboard-causaseal.md` | The approved 12-shot storyboard |
| `composition/index.html` | The film: layers, scenes, tween lib, `render(t)` |
| `composition/vertical.js` | 1080×1920 wrapper + captions |
| `composition/kit.css` | Tokens, type scale, devices (laptop/phone), badges, stamps |
| `composition/characters.js` | The four SVG characters |
| `style-frames/*.html`, `render.mjs` | Style frames and their renderer |
| `scripts/render-video.mjs` | stills / video / videomap / vertical / vstills |
| `scripts/timemap.json`, `timemap.mjs` | Composition-time ↔ output-time map |
| `scripts/build-audio.mjs` | Synth bed, SFX cue sheet, music, loudness (`MAP=1` for the voiced timeline) |
| `scripts/tts.mjs`, `stt-check.mjs` | OpenRouter TTS and Whisper QA |
| `scripts/script-Iapetus.json` | Final narration lines + per-line style notes |
| `scripts/voice-plan.mjs`, `mix-voice.mjs` | Narration anchors and the ducked mix |
| `scripts/build-captions.mjs` | Caption timing from speech segments |
| `scripts/engine-data.mjs`, `lab-variants.mjs` | Pull real decisions from the product engine |
| `scripts/capture.mjs`, `capture-en.mjs` | Real-app screen capture (with actions) |
| `scripts/build-images.mjs`, `images-src/images.html` | Product image templates and export |
| `scripts/finalize.sh` | Poster-as-frame-0 + mux |

These files are CAUSASEAL-specific (scene timings, copy, engine paths). Reuse the **structure and
helpers**; rewrite scenes, copy and data for each project.

### Sources consulted (2026-09-29)
- latent-spaces/brag — https://github.com/latent-spaces/brag
- OpenRouter TTS docs — https://openrouter.ai/docs/guides/overview/multimodal/tts
- OpenRouter Gemini 3.8 Flash TTS — https://openrouter.ai/google/gemini-3.8-flash-tts
- OpenRouter transcription tutorial — https://openrouter.ai/blog/tutorials/transcription-on-openrouter/
- Google Gemini speech generation — https://ai.google.dev/gemini-api/docs/speech-generation
- Gemini API pricing — https://ai.google.dev/gemini-api/docs/pricing
- Gemini 3.8 Flash TTS overview (CellCog) — https://cellcog.ai/blog/gemini-3-8-flash-tts/
- Azure TTS pricing (TextToLab) — https://texttolab.com/blog/azure-text-to-speech-pricing
