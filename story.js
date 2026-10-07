/* =====================================================================
   KITCHEN BY KIAN: SCROLL STORY (home page)
   Scene 1 plays the real video frames (photos/story/f001–f060.webp) as you scroll.
   Scene 2 separates the roll's layers. Scene 3 swaps the real photos.
   ===================================================================== */
(function () {
  const $ = s => document.querySelector(s);
  const s1 = $("#ss1"), s2 = $("#ss2"), s3 = $("#ss3");
  if (!s1 || !s2 || !s3) return;
  const C = window.CONFIG || {}, K = window.KBK || {};
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("simple");
  if (still) document.body.classList.add("ss-still");

  /* prices + social links come from config.js, so they stay in sync */
  const prod = (C.products || [])[0];
  if (prod && $("#ssPacks")) $("#ssPacks").innerHTML = prod.packs.map(pk => {
    const pr = typeof pk.price === "object" ? Object.values(pk.price)[0] : pk.price;
    return `<div class="ss-pk"><div class="n">${pk.name}</div><div class="p">${pr ? (K.rs ? K.rs(pr) : "Rs " + pr.toLocaleString()) : "Ask on WhatsApp"}</div></div>`;
  }).join("");
  const soc = document.querySelector("footer .social");
  if (soc && $("#ssSocial")) $("#ssSocial").appendChild(soc.cloneNode(true));

  function progress(el) {
    const r = el.getBoundingClientRect(), total = el.offsetHeight - innerHeight;
    return total > 0 ? clamp(-r.top / total) : 1;
  }
  function steps(root, p) {
    root.querySelectorAll("[data-r]").forEach(n => {
      const [a, b] = n.dataset.r.split(",").map(Number);
      n.classList.toggle("on", p >= a && p < b);
    });
  }

  /* ---- scene 1: frame sequence ---- */
  const N = 60, cv = $("#ssCanvas"), cx = cv.getContext("2d"), frames = [];
  const src = i => `photos/story/f${String(i + 1).padStart(3, "0")}.webp`;
  let want = 0, shown = -1, loading = false;
  function paint(i) {
    want = i;
    const im = frames[i];
    if (im && im.complete && im.naturalWidth) { cx.drawImage(im, 0, 0, cv.width, cv.height); shown = i; return; }
    // draw the nearest frame that is ready while this one loads
    for (let d = 1; d < N; d++) for (const j of [i - d, i + d]) {
      const f = frames[j]; if (f && f.complete && f.naturalWidth) { cx.drawImage(f, 0, 0, cv.width, cv.height); return; }
    }
  }
  function load() {
    if (loading) return; loading = true;
    for (let i = 0; i < N; i++) { const im = new Image(); im.decoding = "async"; im.onload = () => { if (i === want || shown === -1) paint(want); }; im.src = src(i); frames[i] = im; }
  }
  // first frame straight away, the rest when the visitor gets close
  const first = new Image(); first.onload = () => { if (shown === -1) { cx.drawImage(first, 0, 0, cv.width, cv.height); } }; first.src = src(0); frames[0] = first;
  if ("IntersectionObserver" in window) new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: "120% 0px" }).observe(s1);
  else load();

  function scene1(p) {
    const i = Math.min(N - 1, Math.floor(seg(p, .02, .98) * N));
    if (i !== shown) paint(i);
    steps(s1, p);
  }

  /* ---- scene 2: layers ---- */
  const L = { top: $("#ssLtop"), chs: $("#ssLchs"), chk: $("#ssLchk"), bot: $("#ssLbot") }, lis = s2.querySelectorAll("#ssLayers li"), sh = $("#ssSh");
  function scene2(p) {
    const e = ease(seg(p, .08, .75));
    L.top.setAttribute("transform", `translate(0 ${-e * 95}) rotate(${-e * 3} 300 160)`);
    L.chs.setAttribute("transform", `translate(0 ${-e * 28})`);
    L.chk.setAttribute("transform", `translate(0 ${e * 30})`);
    L.bot.setAttribute("transform", `translate(0 ${e * 80}) rotate(${e * 2} 300 270)`);
    sh.setAttribute("rx", 200 - e * 30);
    lis.forEach((li, i) => li.classList.toggle("on", p > .1 + i * .17));
  }

  /* ---- scene 3: photos ---- */
  function scene3(p) { steps(s3, p); }

  let ticking = false;
  function frame() {
    ticking = false;
    if (still) { load(); scene1(.5); scene2(1); scene3(.99); return; }
    scene1(progress(s1)); scene2(progress(s2)); scene3(progress(s3));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", frame);
  frame();
})();

/* ---- 3D hero: rolls layer follows the mouse (desktop) and the scroll (phones) ---- */
(function () {
  const stage = document.getElementById("stage");
  if (!stage || matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("simple")) return;
  const get = () => stage.querySelector(".h3d");
  stage.addEventListener("pointermove", e => {
    const h = get(); if (!h) return; const r = stage.getBoundingClientRect();
    h.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5) * 2);
    h.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5) * 2);
  });
  stage.addEventListener("pointerleave", () => { const h = get(); if (h) { h.style.setProperty("--mx", 0); h.style.setProperty("--my", 0); } });
  let t = false;
  addEventListener("scroll", () => { if (t) return; t = true; requestAnimationFrame(() => { t = false;
    const h = get(); if (!h) return; const r = stage.getBoundingClientRect();
    h.style.setProperty("--sy", Math.max(-1, Math.min(1, -r.top / innerHeight))); }); }, { passive: true });
})();
