/* Vertical 1080×1920 cut (?layout=vertical). Reuses the landscape stage untouched:
   headlines move to a top panel, the stage is scaled into the middle band, captions sit above
   TikTok's bottom UI. render(t, u): t = composition time, u = output time (captions). */
(function () {
  if (new URLSearchParams(location.search).get("layout") !== "vertical") return
  document.documentElement.classList.add("vert")

  const css = document.createElement("style")
  css.textContent = `
    html.vert, html.vert body { width: 1080px; height: 1920px; background: #0b1220; }
    #vframe { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; direction: rtl; }
    #vnight { position: absolute; inset: 0; background: radial-gradient(900px 1200px at 50% 40%, #16223b 0%, #0b1220 70%); }
    #vday { position: absolute; inset: 0; background: radial-gradient(900px 1300px at 50% 40%, #ffffff 0%, #fcfcfd 60%, #f2f5f3 100%); }
    #vbrand { position: absolute; top: 168px; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 14px;
              font: 700 30px/1 "Plex"; direction: ltr; }
    #vbrand .logo-cs { width: 46px; height: 46px; line-height: 46px; font-size: 19px; border-radius: 12px; }
    #vbrand b { color: var(--sa-500); font-weight: 700; }
    #vtop { position: absolute; top: 250px; left: 60px; right: 60px; height: 360px; }
    .vslot { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .vslot > div { position: static !important; width: auto !important; transform: none !important; }
    .vslot .h2 { font-size: 66px !important; line-height: 1.28; text-align: center; }
    #vstage { position: absolute; left: 0; top: 625px; width: 1080px; height: 713px; overflow: hidden; }
    #vstage { -webkit-mask-image: linear-gradient(transparent 0, #000 9%, #000 91%, transparent 100%); mask-image: linear-gradient(transparent 0, #000 9%, #000 91%, transparent 100%); }
    html.vert #s34w { transform: scale(0.86); transform-origin: 50% 55%; }
    #vstage #stage { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(0.66); transform-origin: 50% 50%; }
    #vcap { position: absolute; top: 1375px; left: 60px; right: 60px; height: 230px; display: flex; align-items: flex-start; justify-content: center; text-align: center; }
    #vcap span { display: inline-block; max-width: 960px; font: 700 52px/1.45 "Plex"; color: #fff; background: rgba(13,18,28,.9);
                 padding: 14px 30px; border-radius: 20px; box-shadow: 0 16px 40px -18px rgba(0,0,0,.6); }
    #vcap span.en-mix { direction: rtl; unicode-bidi: plaintext; }
  `
  document.head.appendChild(css)

  const stage = document.getElementById("stage")
  const frame = document.createElement("div")
  frame.id = "vframe"
  frame.innerHTML = `<div id="vnight"></div><div id="vday"></div>
    <div id="vbrand"><span class="logo-cs">CS</span><span>CAUSASEAL</span><b>· SAIF 2026</b></div>
    <div id="vtop"></div><div id="vstage"></div><div id="vcap"><span class="en-mix"></span></div>`
  document.body.appendChild(frame)
  document.getElementById("vstage").appendChild(stage)

  // headline container → the scene that owns it
  const owner = { h2: "s12n", h4: "s34", h6: "s6", h7: "s7", h8: "s8", h9: "s9", h10a: "s10", h10b: "s10", h11: "s10" }
  const slots = Object.entries(owner).map(([hid, sid]) => {
    const w = document.createElement("div")
    w.className = "vslot"
    document.getElementById("vtop").appendChild(w)
    w.appendChild(document.getElementById(hid))
    return [w, document.getElementById(sid)]
  })

  let caps = []
  window.setCaptions = (c) => { caps = c }
  const base = window.render
  const brand = document.getElementById("vbrand"), vday = document.getElementById("vday")
  const capBox = document.getElementById("vcap"), capSpan = capBox.querySelector("span")

  window.render = function (t, u) {
    base(t)
    for (const [w, scene] of slots) {
      let el = scene, vis = true, op = 1
      while (el && el !== stage) {
        if (el.style.display === "none") { vis = false; break }
        if (el.style.opacity !== "") op *= parseFloat(el.style.opacity)
        el = el.parentElement
      }
      w.style.display = vis ? "" : "none"
      w.style.opacity = vis ? op : 0
    }
    const k = Math.min(1, Math.max(0, (t - 22.5) / 0.9))
    vday.style.opacity = k
    brand.style.color = k > 0.5 ? "#0d121c" : "#e6ebf5"
    const uu = u ?? t
    const c = caps.find((x) => uu >= x.a && uu < x.b)
    const txt = c ? c.text : ""
    if (capSpan.textContent !== txt) capSpan.textContent = txt
    const fade = c ? Math.min(1, (uu - c.a) / 0.12) : 0
    capBox.style.opacity = fade
    capSpan.style.transform = `translateY(${(1 - fade) * 10}px)`
  }
})()
