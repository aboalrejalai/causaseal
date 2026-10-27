# Hyperframes Composition Brief: CAUSASEAL frames

## Objective
Restage the existing 64-second CAUSASEAL brag inside device frames with two flat characters and top/bottom motion. Same cards and lines. Do not replace `brag-output/motion-graphics.mp4`.

## Output
- Composition directory: `brag-output-frames/composition/`
- Rendered video: `brag-output-frames/motion-graphics.mp4`
- Format: landscape — 1920x1080
- Duration: 64 seconds

## Source Material
- Prior composition: `brag-output/composition/index.html`
- Storyboard: `brag-output-frames/brag-plan.md`
- Cut label in code: `engine/ops-agent.mjs` — «تعليمة في النص المسترجع»

## Creative Direction
- Tone preset: polished
- Same copy as the current film, except the known-leak cut badge and the outro line
- Outro line: «الأصل لا يُرسل.»
- Frames: phone app, computer, AI window titled «وكيل», phone features
- Characters: SVG agent and seal. No new sentences
- Motion: titles from `y: -48`, devices/cards/characters from `y: 72`, reverse exit 0.25s before each cut
- Avoid: page-white floating cards, spinning devices, glass glare, 90%/99%, live Entra/EHR/SIEM

## Visual Identity
- Background: #fcfcfd
- Text: #0d121c
- Accent: #1b8354
- Display font: IBM Plex Sans Arabic (local OTF)

## Storyboard
Use `brag-output-frames/brag-plan.md`. Each scene records frame, character, and enter axis.

## Audio
- Music: assets/music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3 through ~58s
- SFX: soft impacts on the hook cut and the mutated row; quiet clicks on sequential badges, rows, and connector cards
- Local files only

## Hyperframes Instructions
Standalone `index.html`. One paused GSAP timeline registered as `causaseal-frames`. CSS tilt lives on an inner node that GSAP does not tween. `npx hyperframes check` must pass before render.
