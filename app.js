/* Kitchen by Kian: shared site logic (header, footer, cart, shop, checkout).
   Business details live in config.js, so you normally don't need to edit this file. */
(function () {
  const C = window.CONFIG;
  const PRE = C.launchMode === "prelaunch";
  const QS = new URLSearchParams(location.search);
  document.documentElement.dataset.theme = QS.get("theme") || C.theme;
  if (PRE) document.body.classList.add("pre");
  if ((QS.get("style") || C.style) === "simple") document.body.classList.add("simple");
  const page = document.body.dataset.page || "home";

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = n => "Rs. " + Number(n).toLocaleString("en-PK");
  const rs = n => n ? money(n) : (PRE ? "Price at launch" : "Ask on WhatsApp");
  const wa = msg => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const general = PRE
    ? "Assalam o Alaikum! Please add me to the Kitchen by Kian launch list. I'd like the opening-day offer."
    : "Assalam o Alaikum! I'd like to order Cheese Chaska Rolls from Kitchen by Kian.";
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';

  /* ---------- product icons (replaced automatically when you add photos) ---------- */
  const G = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const plate = `<ellipse cx="200" cy="232" rx="150" ry="28" ${G}/><ellipse cx="200" cy="232" rx="120" ry="18" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="2"/>`;
  const ART = {
    roll: `<svg viewBox="0 0 400 300">${plate}<g ${G}><rect x="95" y="160" width="170" height="52" rx="26" transform="rotate(-8 180 186)"/><rect x="150" y="128" width="160" height="52" rx="26" transform="rotate(6 230 154)"/><ellipse cx="306" cy="160" rx="13" ry="22" transform="rotate(6 230 154)"/><path d="M318 166c16 4 26 14 24 30"/><path d="M120 180l120-16M128 196l110-15" stroke-opacity=".45"/></g></svg>`,
    kabab: `<svg viewBox="0 0 400 300">${plate}<g ${G}><ellipse cx="140" cy="200" rx="52" ry="22"/><ellipse cx="260" cy="200" rx="52" ry="22"/><ellipse cx="200" cy="168" rx="52" ry="22"/></g></svg>`,
    samosa: `<svg viewBox="0 0 400 300">${plate}<g ${G}><path d="M95 222 155 100 215 222Z"/><path d="M185 222 245 92 305 222Z"/><path d="M155 100v122M245 92v130" stroke-opacity=".45"/></g></svg>`,
    dessert: `<svg viewBox="0 0 400 300">${plate}<g ${G}><path d="M120 222c0-56 36-84 80-84s80 28 80 84"/><path d="M200 138v-20M188 112c4-10 20-10 24 0"/><circle cx="170" cy="180" r="4"/><circle cx="215" cy="168" r="4"/><circle cx="235" cy="195" r="4"/></g></svg>`
  };
  // Real photo (with an optional "Serving suggestion" label) or the gold line icon
  const pic = p => p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">${p.imageNote ? `<span class="pic-note">${esc(p.imageNote)}</span>` : ""}`
    : (ART[p.art] || ART.roll);
  const product = id => C.products.find(p => p.id === id);
  // a pack price can be one number, or a different price per type: { "Frozen": 1500, ... }
  const priceOf = (pk, type) => !pk ? 0 : (typeof pk.price === "object" ? (pk.price[type] || 0) : (pk.price || 0));
  const minPrice = p => Math.min(...p.packs.flatMap(pk => p.types.map(t => priceOf(pk, t))).filter(n => n > 0).concat([Infinity]));

  /* ---------- cart (saved in this browser) ---------- */
  const KEY = "kbk_cart_v1";
  let mem = [];
  // keeps only items that can still be ordered (removes old carts with Fresh/Fried or Coming Soon items)
  const orderable = i => { const p = product(i.id); return p && p.status === "available" && p.types.includes(i.type) && p.packs.some(k => k.name === i.pack); };
  const fresh = items => items.filter(orderable).map(i => { const p = product(i.id); return { ...i, name: p.name, price: priceOf(p.packs.find(k => k.name === i.pack), i.type) }; });
  const load = () => { let items; try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = mem; } return fresh(items); };
  const save = items => { mem = items; try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} updateCount(true); };
  const Cart = {
    items: load,
    add(id, pack, type, qty) {
      const p = product(id); if (!p || p.status !== "available") return;
      const pk = p.packs[pack];
      const key = `${id}|${pk.name}|${type}`;
      const items = load(); const ex = items.find(i => i.key === key);
      if (ex) ex.qty = Math.min(ex.qty + qty, 50);
      else items.push({ key, id, name: p.name, pack: pk.name, type, price: priceOf(pk, type), qty });
      save(items);
    },
    set(key, qty) { let items = load(); const it = items.find(i => i.key === key); if (!it) return; it.qty = qty; if (qty < 1) items = items.filter(i => i.key !== key); save(items); },
    remove(key) { save(load().filter(i => i.key !== key)); },
    clear() { save([]); },
    count() { return load().reduce((a, i) => a + i.qty, 0); },
    subtotal() { return load().reduce((a, i) => a + i.price * i.qty, 0); },
    priced() { return load().every(i => i.price > 0); }
  };
  window.KBK = { Cart, rs, wa, pic, product, PRE, money, priceOf, minPrice };

  function totals(pickup) {
    const sub = Cart.subtotal(), d = C.delivery;
    const free = !pickup && d.freeAbove && sub >= d.freeAbove;
    const fee = !pickup && d.fee && !free ? d.fee : 0;
    return { sub, fee, free, pickup: !!pickup, total: sub + fee, priced: Cart.priced() && Cart.count() > 0 };
  }

  /* ---------- header / banner / footer / drawer ---------- */
  const NAV = [["/", "Home", "home"], ["shop.html", "Shop", "shop"], ["about.html", "About", "about"], ["contact.html", "Contact", "contact"]];
  const top = $("#site-header");
  if (top) top.outerHTML = `
    ${PRE ? `<div class="prelaunch">✨ Launching soon in Lahore. <a class="wa-link" href="#">${esc(C.launchOffer)}</a></div>` : ""}
    <nav><div class="wrap">
      <a href="/" class="logo"><b>KITCHEN</b><i>by Kian</i></a>
      <div class="links" id="navLinks">${NAV.map(([h, t, k]) => `<a href="${h}" class="${k === page ? "active" : ""}">${t}</a>`).join("")}</div>
      <div class="nav-right">
        <a class="btn sm" href="shop.html">${PRE ? "Reserve Now" : "Order Now"}</a>
        <button class="cart-btn" id="cartBtn" aria-label="Open cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
          <span class="cart-count" id="cartCount">0</span>
        </button>
        <button class="burger" id="burger" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      </div>
    </div></nav>`;

  const foot = $("#site-footer");
  if (foot) foot.outerHTML = `
    <footer><div class="wrap">
      <div class="foot-cols">
        <div><a href="/" class="logo"><b>KITCHEN</b><i>by Kian</i></a>
          <p style="margin-top:.8rem;max-width:320px">Premium homemade food from our family kitchen in Lahore. Homemade, handcrafted, premium.</p>
</div>
        <div><h5>Explore</h5>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="checkout.html">Checkout</a></div>
        <div><h5>Order</h5><a class="wa-link" href="#">WhatsApp</a><span style="display:block;padding:3px 0">${esc(C.delivery.areas)}</span><span style="display:block;padding:3px 0">${esc(C.delivery.timing)}</span>${C.email ? `<a href="mailto:${esc(C.email)}">${esc(C.email)}</a>` : ""}</div>
      </div>
      <div class="follow"><h5>Follow Us</h5>
          <div class="social social-center">
            <a href="${C.social.instagram}" aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 3.8c2.7 0 3 0 4 .1 2.7.1 4 1.4 4.1 4.1.1 1 .1 1.4.1 4s0 3-.1 4c-.1 2.7-1.4 4-4.1 4.1-1 .1-1.4.1-4 .1s-3 0-4-.1c-2.8-.1-4-1.4-4.1-4.1-.1-1-.1-1.4-.1-4s0-3 .1-4C4 5.3 5.3 4 8 3.9c1 0 1.4-.1 4-.1ZM12 2c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.1 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.2 5.7-2.1 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.2-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2Z"/></svg></a>
            <a href="${C.social.facebook}" aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.3 2 10 3.6 10 6.2V8H8v3h2v11h4V11h2.7l.3-3h-3Z"/></svg></a>
            <a href="${C.social.tiktok}" aria-label="TikTok" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.7V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a8.1 8.1 0 0 0 3.8 1.2V6.7Z"/></svg></a>
          </div>
      </div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} Kitchen by Kian · Homemade in Lahore</span><span>${C.delivery.payment.join(" · ")}</span></div>
    </div></footer>
    <a class="float wa-link" href="#" aria-label="Chat on WhatsApp">${WA_ICON.replace('fill="currentColor"', "")}</a>
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-label="Your cart">
      <header><h3>Your Cart</h3><button class="x" id="closeCart" aria-label="Close">✕</button></header>
      <div class="items" id="drawerItems"></div>
      <footer id="drawerFoot"></footer>
    </aside>
    <div class="toast" id="toast"></div>`;

  // WhatsApp links + mobile menu
  $$(".wa-link").forEach(a => { a.href = wa(general); a.target = "_blank"; a.rel = "noopener"; });
  const burger = $("#burger"); if (burger) burger.onclick = () => $("#navLinks").classList.toggle("open");

  /* ---------- drawer ---------- */
  const drawer = $("#drawer"), overlay = $("#overlay");
  const openCart = () => { renderDrawer(); drawer.classList.add("open"); overlay.classList.add("open"); };
  const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("open"); };
  if ($("#cartBtn")) $("#cartBtn").onclick = openCart;
  if (overlay) overlay.onclick = closeCart;
  if ($("#closeCart")) $("#closeCart").onclick = closeCart;
  addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

  function itemRow(i, small) {
    const p = product(i.id) || {};
    const pk = (p.packs || []).find(k => k.name === i.pack) || {};
    const timg = pk.image || p.image;
    const thumb = timg ? `<img src="${esc(timg)}" alt="" loading="lazy">` : (ART[p.art] || ART.roll);
    return `<div class="citem"><div class="th">${thumb}</div>
      <div><b>${esc(i.name)}</b><small>${esc(i.pack)} · ${esc(i.type)}</small>
        ${small ? `<small>Qty ${i.qty}</small>` : `<div class="step" style="margin-top:6px"><button data-k="${esc(i.key)}" data-d="-1">−</button><span>${i.qty}</span><button data-k="${esc(i.key)}" data-d="1">+</button></div>
        <button class="rm" data-rm="${esc(i.key)}">Remove</button>`}</div>
      <div style="color:var(--gold);font-weight:600;white-space:nowrap">${i.price ? money(i.price * i.qty) : ""}</div></div>`;
  }
  function renderDrawer() {
    const items = Cart.items(), box = $("#drawerItems"), ft = $("#drawerFoot");
    if (!box) return;
    if (!items.length) {
      box.innerHTML = `<div class="empty"><p>Your cart is empty.</p><a class="btn sm" href="shop.html">Go to Shop</a></div>`; ft.innerHTML = ""; return;
    }
    box.innerHTML = items.map(i => itemRow(i)).join("");
    const t = totals();
    ft.innerHTML = `<div class="sum"><span>Subtotal</span><b>${t.priced ? money(t.sub) : rs(0)}</b></div>
      <a class="btn" href="checkout.html">${PRE ? "Reserve for Launch Day" : "Proceed to Checkout"}</a>
      <p class="note" style="text-align:center">${C.pickup && C.pickup.enabled ? "Delivery or pickup" : "Delivery"} is confirmed on WhatsApp.</p>`;
    box.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { const it = Cart.items().find(i => i.key === b.dataset.k); Cart.set(b.dataset.k, it.qty + +b.dataset.d); renderDrawer(); });
    box.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { Cart.remove(b.dataset.rm); renderDrawer(); });
  }
  function updateCount(bump) {
    const el = $("#cartCount"); if (!el) return;
    el.textContent = Cart.count();
    if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    if (window.onCartChange) window.onCartChange();
  }
  function toast(msg) { const t = $("#toast"); if (!t) return; t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200); }
  updateCount(false);

  /* ---------- product cards (shop + home) ---------- */
  window.renderProducts = function (el, opts = {}) {
    let list = C.products;
    if (opts.status) list = list.filter(p => (p.status === "available") === (opts.status === "available"));
    el.classList.toggle("one", list.length === 1);
    el.innerHTML = list.map((p, n) => {
      const soon = p.status !== "available";
      const badge = soon ? "Coming Soon" : (PRE ? "Launching First" : (p.badge || "Bestseller"));
      if (soon) return `<div class="pcard soon tilt reveal d${n % 3}"><div class="shine"></div><span class="badge">${badge}</span>
        <div class="pic">${pic(p)}</div><div class="pbody"><h3>${esc(p.name)}</h3>${p.subtitle ? `<div class="sub2">${esc(p.subtitle)}</div>` : ""}<p class="d">${esc(p.desc)}</p>
        <div class="buy"><span class="pr"></span><a class="notify" target="_blank" rel="noopener" href="${wa(`Assalam o Alaikum! Please notify me when ${p.name} launches at Kitchen by Kian.`)}">Notify me</a></div></div></div>`;
      const packImgs = p.packs.some(k => k.image);
      const picHtml = packImgs ? p.packs.map((k, i) => `<img class="pack-img${i ? "" : " on"}" data-pack="${i}" src="${esc(k.image || p.image)}" alt="${esc(p.name)}, ${esc(k.name)}" ${i ? 'loading="lazy"' : ""}>`).join("") : pic(p);
      return `<div class="pcard tilt reveal d${n % 3}" data-id="${p.id}"><div class="shine"></div><span class="badge">${badge}</span>
        <div class="pic${packImgs ? " has-pack" : ""}">${picHtml}</div><div class="pbody"><h3>${esc(p.name)}</h3>${p.subtitle ? `<div class="sub2">${esc(p.subtitle)}</div>` : ""}<p class="d">${esc(p.desc)}</p>
        <div class="lbl">Pack size</div><div class="seg" data-g="pack">${p.packs.map((k, i) => `<button type="button" data-v="${i}" class="${i ? "" : "on"}">${esc(k.name)}</button>`).join("")}</div>
        ${p.types.length > 1 ? `<div class="lbl">Type</div><div class="seg" data-g="type">${p.types.map((k, i) => `<button type="button" data-v="${i}" class="${i ? "" : "on"}">${esc(k)}</button>`).join("")}</div>` : ""}
        <div class="buy"><span class="pr">${rs(priceOf(p.packs[0], p.types[0]))}</span>
          <div style="display:flex;gap:8px;align-items:center"><div class="step"><button type="button" data-q="-1">−</button><span class="qv">1</span><button type="button" data-q="1">+</button></div>
          <button type="button" class="btn sm add">Add to Cart</button></div></div></div></div>`;
    }).join("");
    $$(".pcard[data-id]", el).forEach(card => {
      const p = product(card.dataset.id); let pack = 0, type = 0, qty = 1;
      const upd = () => { const pr = priceOf(p.packs[pack], p.types[type]); card.querySelector(".pr").textContent = pr ? money(pr * qty) : rs(0); card.querySelector(".qv").textContent = qty; };
      card.querySelectorAll(".seg").forEach(seg => seg.onclick = e => {
        const b = e.target.closest("button"); if (!b) return;
        seg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
        if (seg.dataset.g === "pack") { pack = +b.dataset.v; card.querySelectorAll(".pack-img").forEach(im => im.classList.toggle("on", +im.dataset.pack === pack)); } else type = +b.dataset.v; upd();
      });
      card.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { qty = Math.max(1, Math.min(50, qty + +b.dataset.q)); upd(); });
      card.querySelector(".add").onclick = () => { Cart.add(p.id, pack, p.types[type], qty); toast(`✓ ${p.name} (${p.packs[pack].name}) added to cart`); qty = 1; upd(); };
    });
    initFx(el);
  };

  /* ---------- checkout ---------- */
  window.initCheckout = function () {
    const sumBox = $("#orderSummary"), form = $("#checkoutForm");
    const paySel = $("#payBox"), PK = C.pickup || {}, canPickup = !!PK.enabled;
    const methodBox = $("#methodBox"), pkInfo = $("#pickupInfo"), delFields = $("#deliveryFields");
    const isPickup = () => canPickup && (form.querySelector('input[name="method"]:checked') || {}).value === "pickup";
    // Delivery / Pickup choice (hidden completely if pickup is switched off in config.js)
    if (canPickup && methodBox) {
      methodBox.innerHTML = `<label><b><input type="radio" name="method" value="delivery" checked> Delivery</b><small>${esc(C.delivery.areas)}</small></label>
        <label><b><input type="radio" name="method" value="pickup"> Pickup</b><small>From ${esc(PK.area)}</small></label>`;
      pkInfo.innerHTML = `<b>Pickup from ${esc(PK.area)}</b><br>Hours: ${esc(PK.hours)} · ${esc(C.delivery.timing)}${PK.note ? `<span>${esc(PK.note)}</span>` : ""}`;
    } else if (methodBox) { methodBox.previousElementSibling.remove(); methodBox.remove(); pkInfo && pkInfo.remove(); }
    function drawPay() {
      const cur = (form.querySelector('input[name="pay"]:checked') || {}).value;
      const pk = isPickup();
      paySel.innerHTML = C.delivery.payment.map((p, i) => {
        const label = pk ? p.replace(/on Delivery/i, "on Pickup") : p;
        const checked = cur ? (cur === p || cur === p.replace(/on Delivery/i, "on Pickup")) : !i;
        return `<label><input type="radio" name="pay" value="${esc(label)}" ${checked ? "checked" : ""}> ${esc(label)}</label>`;
      }).join("");
    }
    function setNote() {
      const pk = isPickup();
      $("#coNote").textContent = PRE
        ? `No payment now. We'll confirm your reservation, price and ${pk ? "pickup time" : "delivery"} on WhatsApp before launch day.`
        : (pk ? "Your order opens in WhatsApp, ready to send. We'll confirm the total, pickup time and address with you before preparing it."
              : "Your order opens in WhatsApp, ready to send. We'll confirm the total, delivery charge and delivery time with you before preparing it.");
    }
    function applyMethod() {
      const pk = isPickup();
      if (delFields) { delFields.hidden = pk; delFields.querySelectorAll(".field").forEach(f => f.classList.remove("bad")); }
      if (pkInfo) pkInfo.hidden = !pk;
      if ($("#whLabel")) $("#whLabel").textContent = pk ? "Preferred pickup day & time" : "Preferred delivery day & time";
      if ($("#wh")) $("#wh").placeholder = pk ? `e.g. Saturday 6 PM (${PK.hours || ""})` : "e.g. Saturday evening";
      drawPay(); setNote(); draw();
    }
    if (PRE) { $("#coTitle").textContent = "Reserve for Launch Day"; $("#placeBtn span").textContent = "Send Reservation on WhatsApp"; }
    function draw() {
      const items = Cart.items();
      if (!items.length) { sumBox.innerHTML = `<div class="empty"><p>Your cart is empty.</p><a class="btn sm" href="shop.html">Go to Shop</a></div>`; $("#placeBtn").disabled = true; return; }
      $("#placeBtn").disabled = false;
      const t = totals(isPickup());
      sumBox.innerHTML = `<div class="osum">${items.map(i => itemRow(i, true)).join("")}</div>
        <div class="line"><span>Subtotal</span><span>${t.priced ? money(t.sub) : rs(0)}</span></div>
        ${t.pickup ? `<div class="line"><span>Pickup</span><span>Free · ${esc(PK.area)}</span></div>`
          : `<div class="line"><span>Delivery</span><span>${t.free ? "Free" : (C.delivery.fee ? money(C.delivery.fee) : "Confirmed on WhatsApp")}</span></div>`}
        <div class="line tot"><span>Total${t.pickup || C.delivery.fee || t.free ? "" : " (+ delivery)"}</span><b>${t.priced ? money(t.total) : rs(0)}</b></div>
        <a href="shop.html" class="note" style="display:inline-block;color:var(--gold)">← Edit cart</a>`;
    }
    window.onCartChange = draw;
    form.addEventListener("change", e => { if (e.target.name === "method") applyMethod(); });
    applyMethod();
    form.addEventListener("input", e => { const f = e.target.closest(".field"); if (f) f.classList.remove("bad"); });
    form.onsubmit = e => {
      e.preventDefault();
      let ok = true;
      const pk = isPickup();
      $$(".field[data-req]", form).forEach(f => {
        if (pk && f.closest("#deliveryFields")) { f.classList.remove("bad"); return; } // no address needed for pickup
        const inp = f.querySelector("input,select,textarea"); let v = inp.value.trim();
        let bad = !v; if (inp.name === "phone") bad = !/^(\+?92|0)?3\d{9}$/.test(v.replace(/[\s-]/g, ""));
        f.classList.toggle("bad", bad); if (bad) ok = false;
      });
      if (!ok) { $(".field.bad input,.field.bad select", form)?.focus(); return; }
      const d = Object.fromEntries(new FormData(form)); const t = totals(pk); const items = Cart.items();
      if (!items.length) return;
      const msg = [
        PRE ? "Assalam o Alaikum! I'd like to RESERVE an order for Kitchen by Kian's launch day:" : "Assalam o Alaikum! New order from kitchenbykian.com:",
        "",
        pk ? `*PICKUP* (I'll collect from ${PK.area})` : "*DELIVERY*",
        "",
        ...items.map(i => `• ${i.qty} × ${i.name}${(product(i.id)||{}).subtitle ? " – " + product(i.id).subtitle : ""} (${i.pack})${i.price ? " = " + money(i.price * i.qty) : ""}`),
        "",
        t.priced ? `Subtotal: ${money(t.sub)}` : null,
        t.priced ? (pk ? "Pickup: Free" : `Delivery: ${t.free ? "Free" : (C.delivery.fee ? money(C.delivery.fee) : "to confirm")}`) : null,
        t.priced ? `TOTAL: ${money(t.total)}${pk || C.delivery.fee || t.free ? "" : " + delivery"}` : null,
        t.priced ? "" : null,
        `Name: ${d.name}`, `Phone: ${d.phone}`,
        ...(pk ? [`Order type: PICKUP`] : [`Area: ${d.area}`, `Address: ${d.address}`]),
        d.when ? `Preferred ${pk ? "pickup" : "delivery"}: ${d.when}` : null, `Payment: ${d.pay}`, d.notes ? `Notes: ${d.notes}` : null
      ].filter(l => l !== null).join("\n");
      try { window.open(wa(msg), "_blank", "noopener"); } catch (e) {}
      Cart.clear();
      $("#coWrap").innerHTML = `<div class="panel" style="text-align:center;max-width:620px;margin:0 auto">
        <div class="eyebrow">Thank you, ${esc(d.name.split(" ")[0])}</div>
        <h2>${PRE ? "Reservation Sent!" : "Order Sent!"}</h2>
        <p class="sub" style="margin:0 auto 1.4rem">Tap the button below to open WhatsApp, then press <b>Send</b>. We'll confirm everything with you shortly.</p>
        <a class="btn" href="${wa(msg)}" target="_blank" rel="noopener">${WA_ICON} Open WhatsApp &amp; Send</a>
        <p class="note"><a href="/" style="color:var(--gold)">Back to Home</a></p></div>`;
      scrollTo({ top: 0, behavior: "smooth" });
    };
  };

  /* ---------- contact form ---------- */
  window.initContact = function () {
    const f = $("#contactForm"); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (!d.name.trim() || !d.message.trim()) { toast("Please add your name and message"); return; }
      const link = wa(`Assalam o Alaikum! My name is ${d.name}.\n\n${d.message}`);
      try { window.open(link, "_blank", "noopener"); } catch (e) {}
      let box = $("#contactSent"); if (!box) { f.insertAdjacentHTML("beforeend", '<p class="note" id="contactSent"></p>'); box = $("#contactSent"); }
      box.innerHTML = `Your message is ready. If WhatsApp didn't open, <a href="${link}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:underline">tap here to open it</a>.`;
    };
  };

  /* ---------- hero (home) ---------- */
  const stage = $("#stage");
  if (stage) {
    stage.dataset.hero = QS.get("hero") || C.heroStyle;
    const box = $("#heroMedia");
    const cap = C.heroCaption ? `<span class="pic-note">${esc(C.heroCaption)}</span>` : "";
    if (C.heroVideo) { box.insertAdjacentHTML("afterbegin", `<video src="${esc(C.heroVideo)}" ${C.heroImage ? `poster="${esc(C.heroImage)}"` : ""} autoplay muted loop playsinline></video>${cap}`); stage.classList.add("has-media"); }
    else if (C.heroImage) { box.insertAdjacentHTML("afterbegin", `<img src="${esc(C.heroImage)}" alt="Kitchen by Kian Cheese Chaska Roll">${cap}`); stage.classList.add("has-media"); }
    if (PRE) { $$(".cta-long").forEach(e => e.textContent = "Join the Launch List"); }
  }
  $$("[data-fill]").forEach(el => {
    const k = el.dataset.fill;
    if (k === "areas") el.textContent = C.delivery.areas;
    if (k === "timing") el.textContent = C.delivery.timing;
    if (k === "fee") el.textContent = C.delivery.fee ? money(C.delivery.fee) + (C.delivery.freeAbove ? ` (free above ${money(C.delivery.freeAbove)})` : "") : "Confirmed on WhatsApp";
    if (k === "payment") el.textContent = C.delivery.payment.join(" · ");
    if (k === "launch" && !PRE) el.remove();
  });
  if (PRE) $$(".pre-swap").forEach(el => el.textContent = el.dataset.pre);

  /* ---------- effects ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  function initFx(root = document) {
    $$(".reveal:not(.in)", root).forEach(el => io.observe(el));
    if (!fine) return;
    $$(".tilt", root).forEach(el => {
      if (el._t) return; el._t = 1;
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 8}deg) rotateY(${(x - .5) * 10}deg) translateY(-4px)`;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
  }
  window.initFx = initFx;
  document.addEventListener("DOMContentLoaded", () => initFx());
  if (document.readyState !== "loading") initFx();
})();
