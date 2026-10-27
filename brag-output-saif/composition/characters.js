/* CAUSASEAL cast — flat geometric SVG characters. Each returns an SVG string.
   Parts carry ids/classes so the composition can animate them later (eyes, arms, clipboard, legs). */
(function () {
  const INK = "#0d121c"
  const SW = 6

  function eyes(state, cx1, cx2, cy) {
    if (state === "spiral") {
      const spiral = (cx) =>
        `<path d="M${cx} ${cy} m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -10 0 a8 8 0 1 1 16 0 a11 11 0 1 1 -22 0" fill="none" stroke="#ff6b5e" stroke-width="4" stroke-linecap="round"/>`
      return `<g class="eyes">${spiral(cx1)}${spiral(cx2)}</g>`
    }
    if (state === "happy") {
      const arc = (cx) => `<path d="M${cx - 12} ${cy + 6} q12 -18 24 0" fill="none" stroke="#54c08a" stroke-width="7" stroke-linecap="round"/>`
      return `<g class="eyes">${arc(cx1)}${arc(cx2)}</g>`
    }
    return `<g class="eyes"><rect x="${cx1 - 9}" y="${cy - 15}" width="18" height="30" rx="9" fill="#54c08a"/><rect x="${cx2 - 9}" y="${cy - 15}" width="18" height="30" rx="9" fill="#54c08a"/></g>`
  }

  /** AI agent — friendly robot. opts: { eyes: normal|spiral|happy, wave: bool, night: bool } */
  function agent(opts = {}) {
    const body = opts.night ? "#dfe6ef" : "#eef2f6"
    const armR = opts.wave
      ? `<g class="arm-r"><rect x="186" y="98" width="30" height="96" rx="15" transform="rotate(24 201 190)" fill="${body}" stroke="${INK}" stroke-width="${SW}"/></g>`
      : `<g class="arm-r"><rect x="186" y="186" width="30" height="92" rx="15" fill="${body}" stroke="${INK}" stroke-width="${SW}"/></g>`
    return `<svg viewBox="0 0 260 380" xmlns="http://www.w3.org/2000/svg" class="char agent">
      <ellipse cx="130" cy="366" rx="84" ry="10" fill="#000" opacity=".18"/>
      <line x1="130" y1="44" x2="130" y2="16" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
      <circle class="bulb" cx="130" cy="14" r="11" fill="#54c08a" stroke="${INK}" stroke-width="5"/>
      <rect x="50" y="44" width="160" height="124" rx="38" fill="${body}" stroke="${INK}" stroke-width="${SW}"/>
      <rect x="70" y="66" width="120" height="80" rx="24" fill="${INK}"/>
      ${eyes(opts.eyes || "normal", 108, 152, 106)}
      <rect x="114" y="168" width="32" height="14" fill="${INK}"/>
      <g class="arm-l"><rect x="44" y="186" width="30" height="92" rx="15" fill="${body}" stroke="${INK}" stroke-width="${SW}"/></g>
      ${armR}
      <rect x="62" y="178" width="136" height="124" rx="32" fill="${body}" stroke="${INK}" stroke-width="${SW}"/>
      <circle cx="130" cy="222" r="14" fill="#25935f" stroke="${INK}" stroke-width="5"/>
      <line x1="100" y1="262" x2="160" y2="262" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <g class="legs"><rect x="92" y="298" width="26" height="58" rx="12" fill="${opts.night ? "#8793ab" : INK}"/><rect x="142" y="298" width="26" height="58" rx="12" fill="${opts.night ? "#8793ab" : INK}"/></g>
    </svg>`
  }

  /** Harness guard — cap + clipboard of tool names. opts: { mood: calm|nod|surprised, tip: bool } */
  function guard(opts = {}) {
    const mouth =
      opts.mood === "surprised"
        ? `<ellipse cx="130" cy="138" rx="8" ry="10" fill="${INK}"/>`
        : `<path d="M116 136 q14 10 28 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    const brows = opts.mood === "surprised"
      ? `<path d="M100 92 q12 -8 22 0 M138 92 q12 -8 22 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : ""
    const cap = `<g class="cap" ${opts.tip ? 'transform="translate(-26 -34) rotate(-22 130 70)"' : ""}>
        <path d="M74 84 q0 -48 56 -50 q56 2 56 50 z" fill="#1f2a44" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
        <rect x="66" y="80" width="128" height="16" rx="8" fill="#111a2e" stroke="${INK}" stroke-width="4"/>
        <circle cx="130" cy="60" r="10" fill="#fdb022" stroke="${INK}" stroke-width="4"/></g>`
    return `<svg viewBox="0 0 260 400" xmlns="http://www.w3.org/2000/svg" class="char guard">
      <ellipse cx="130" cy="386" rx="86" ry="10" fill="#000" opacity=".18"/>
      <circle cx="130" cy="112" r="50" fill="#f1d3b3" stroke="${INK}" stroke-width="${SW}"/>
      ${brows}
      <circle cx="112" cy="110" r="6" fill="${INK}"/><circle cx="148" cy="110" r="6" fill="${INK}"/>
      ${mouth}
      ${cap}
      <rect x="70" y="170" width="120" height="146" rx="30" fill="#344054" stroke="${INK}" stroke-width="${SW}"/>
      <rect x="70" y="252" width="120" height="14" fill="${INK}" opacity=".5"/>
      <path d="M100 196 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 z" fill="#fdb022" stroke="${INK}" stroke-width="3"/>
      <g class="legs"><rect x="94" y="312" width="28" height="64" rx="12" fill="${opts.night ? "#8793ab" : INK}"/><rect x="138" y="312" width="28" height="64" rx="12" fill="${opts.night ? "#8793ab" : INK}"/></g>
      <g class="clipboard">
        <rect x="150" y="196" width="100" height="128" rx="12" fill="#fff" stroke="${INK}" stroke-width="5"/>
        <rect x="178" y="188" width="44" height="18" rx="6" fill="#98a2b3" stroke="${INK}" stroke-width="4"/>
        <line x1="166" y1="232" x2="234" y2="232" stroke="#98a2b3" stroke-width="6" stroke-linecap="round"/>
        <line x1="166" y1="256" x2="234" y2="256" stroke="#98a2b3" stroke-width="6" stroke-linecap="round"/>
        <line x1="166" y1="280" x2="222" y2="280" stroke="#98a2b3" stroke-width="6" stroke-linecap="round"/>
        <circle cx="178" cy="244" r="12" fill="#f1d3b3" stroke="${INK}" stroke-width="4"/>
      </g>
    </svg>`
  }

  /** Disguised payload — customer-data document in a bandit mask with a fake tool badge. opts: { badge, grey, night } */
  function intruder(opts = {}) {
    const badge = opts.badge || "post_update"
    const fill = opts.grey ? "#d0d5dd" : "#fff"
    const leg = opts.night ? "#8793ab" : INK
    return `<svg viewBox="0 0 280 390" xmlns="http://www.w3.org/2000/svg" class="char intruder">
      <defs><filter id="b"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
      <ellipse cx="140" cy="376" rx="84" ry="9" fill="#000" opacity=".2"/>
      <g class="legs"><rect x="96" y="312" width="24" height="54" rx="11" fill="${leg}"/><rect x="156" y="312" width="24" height="54" rx="11" fill="${leg}"/></g>
      <path d="M44 24 h150 l48 48 v230 a14 14 0 0 1 -14 14 h-184 a14 14 0 0 1 -14 -14 v-264 a14 14 0 0 1 14 -14 z" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M194 24 v34 a14 14 0 0 0 14 14 h34" fill="#e4e7ec" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <text x="136" y="106" text-anchor="middle" font-family="Plex" font-weight="700" font-size="27" fill="${INK}" direction="rtl">بيانات العملاء</text>
      <path class="mask" d="M36 126 h208 v42 q-26 14 -56 4 q-18 -8 -48 -8 q-28 0 -46 8 q-30 10 -58 -4 z" fill="${INK}"/>
      <g class="eyes"><ellipse cx="94" cy="146" rx="17" ry="12" fill="#fff"/><ellipse cx="186" cy="146" rx="17" ry="12" fill="#fff"/>
        <circle cx="86" cy="148" r="7" fill="${INK}"/><circle cx="178" cy="148" r="7" fill="${INK}"/></g>
      <g filter="url(#b)" opacity=".9">
        <rect x="62" y="196" width="156" height="16" rx="8" fill="#98a2b3"/>
        <rect x="62" y="226" width="116" height="16" rx="8" fill="#98a2b3"/>
        <rect x="62" y="256" width="140" height="16" rx="8" fill="#98a2b3"/>
      </g>
      <g class="badge" transform="rotate(-5 150 300)">
        <line x1="112" y1="172" x2="120" y2="282" stroke="#fdb022" stroke-width="4"/>
        <line x1="208" y1="172" x2="196" y2="282" stroke="#fdb022" stroke-width="4"/>
        <rect x="66" y="278" width="184" height="50" rx="10" fill="#fef0c7" stroke="${INK}" stroke-width="4"/>
        <text x="158" y="311" text-anchor="middle" font-family="Menlo, monospace" font-weight="700" font-size="21" fill="${INK}">${badge}</text>
      </g>
    </svg>`
  }

  /** CAUSASEAL — wax seal with eyes. opts: { mood: calm|focus|happy } */
  function seal(opts = {}) {
    const bumps = 18, R = 128, r = 116, cx = 150, cy = 150
    let d = ""
    for (let i = 0; i <= bumps * 2; i++) {
      const a = (Math.PI * i) / bumps - Math.PI / 2
      const rad = i % 2 === 0 ? R : r
      d += `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `
    }
    const focus = opts.mood === "focus"
    const happy = opts.mood === "happy"
    const eye = (x) =>
      happy
        ? `<path d="M${x - 16} ${cy - 4} q16 -22 32 0" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`
        : `<ellipse cx="${x}" cy="${cy - 12}" rx="17" ry="${focus ? 15 : 21}" fill="#fff"/><circle cx="${x + 3}" cy="${cy - 9}" r="9" fill="${INK}"/>`
    const brows = focus
      ? `<path d="M${cx - 64} ${cy - 46} l38 10 M${cx + 64} ${cy - 46} l-38 10" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`
      : ""
    return `<svg viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg" class="char seal">
      <ellipse cx="150" cy="316" rx="100" ry="11" fill="#000" opacity=".16"/>
      <path d="${d}Z" fill="#1b8354" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#88d8ad" stroke-width="5" stroke-dasharray="4 11" stroke-linecap="round"/>
      <path d="M${cx - 70} ${cy - 70} a100 100 0 0 1 60 -26" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity=".3"/>
      ${brows}${eye(cx - 38)}${eye(cx + 38)}
      <path d="M${cx - 22} ${cy + 40} q22 ${happy ? 22 : 12} 44 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
    </svg>`
  }

  window.CAST = { agent, guard, intruder, seal }
})()
