(() => {
  "use strict";

  /* ---------- Config ----------
   * Set FORM_ENDPOINT to a Formspree / Getform / own API URL to receive real
   * submissions (POST, JSON). Left empty, the form validates and simulates success. */
  const FORM_ENDPOINT = "";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  let lang = store.get("ap.lang", "ro");
  if (!I18N[lang]) lang = "ro";
  const favs = new Set(store.get("ap.favs", []));

  const t = (key, ...args) => {
    const v = I18N[lang][key] ?? I18N.ro[key] ?? key;
    return typeof v === "function" ? v(...args) : v;
  };
  const hoodName = (id) => NEIGHBORHOODS.find((n) => n.id === id)?.name ?? id;
  const money = (n) =>
    n >= 1e6 ? `$${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : n % 1e5 === 0 ? 1 : 2)}M` : `$${n.toLocaleString("en-US")}`;
  const fullMoney = (n) => `$${n.toLocaleString("en-US")}`;
  const fallback = (img) => {
    img.onerror = null;
    img.src = FALLBACK_IMG;
  };

  /* ---------- i18n ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    fillPropertySelect();
    render();
    renderAreas();
  }
  $$(".lang button").forEach((b) =>
    b.addEventListener("click", () => { lang = b.dataset.lang; store.set("ap.lang", lang); applyLang(); })
  );

  /* ---------- Selects ---------- */
  ["#qHood", "#fHood"].forEach((sel) => {
    const s = $(sel);
    NEIGHBORHOODS.forEach((n) => s.add(new Option(n.name, n.id)));
  });
  function fillPropertySelect() {
    const s = $("#cProperty");
    const cur = s.value;
    s.length = 1;
    PROPERTIES.forEach((p) => s.add(new Option(`${p.title[lang]} — ${money(p.price)}`, p.id)));
    s.value = cur;
  }

  /* ---------- Filters ---------- */
  const state = { keyword: "", hood: "", type: "", min: 0, max: 0, beds: 0, baths: 0, water: false, isNew: false, fav: false, sort: "featured" };

  function filtered() {
    const kw = state.keyword.trim().toLowerCase();
    let list = PROPERTIES.filter((p) => {
      if (kw && !`${p.title.ro} ${p.title.en} ${p.address} ${hoodName(p.hood)}`.toLowerCase().includes(kw)) return false;
      if (state.hood && p.hood !== state.hood) return false;
      if (state.type && p.type !== state.type) return false;
      if (state.min && p.price < state.min) return false;
      if (state.max && p.price > state.max) return false;
      if (p.beds < state.beds || p.baths < state.baths) return false;
      if (state.water && !p.waterfront) return false;
      if (state.isNew && !p.isNew) return false;
      if (state.fav && !favs.has(p.id)) return false;
      return true;
    });
    const sorters = {
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      sizeDesc: (a, b) => b.sqft - a.sqft,
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
    return list;
  }

  const icon = {
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-8h18v8M3 14h18M6 10V7h5v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zM6 12V5a2 2 0 014 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 9h5V4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" fill="currentColor" stroke="currentColor" stroke-width="1.6"/></svg>',
  };

  function card(p) {
    const fav = favs.has(p.id);
    return `
      <article class="card reveal" data-id="${p.id}">
        <div class="card__media">
          <img src="${U(p.images[0], 900)}" alt="${p.title[lang]}" loading="lazy" onerror="this.onerror=null;this.src=FALLBACK_IMG" />
          <div class="card__badges">
            ${p.isNew ? `<span class="badge badge--gold">${t("badge.new")}</span>` : ""}
            ${p.waterfront ? `<span class="badge">${t("badge.water")}</span>` : ""}
          </div>
          <button class="fav ${fav ? "is-on" : ""}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favorite">${icon.heart}</button>
          <span class="card__price">${money(p.price)}</span>
        </div>
        <div class="card__body">
          <p class="card__meta">${hoodName(p.hood)} · ${t("type." + p.type)}</p>
          <h3 class="card__title">${p.title[lang]}</h3>
          <ul class="card__specs">
            <li>${icon.bed}${p.beds} ${t("unit.beds")}</li>
            <li>${icon.bath}${p.baths} ${t("unit.baths")}</li>
            <li>${icon.area}${p.sqft.toLocaleString("en-US")} ${t("unit.sqft")}</li>
          </ul>
          <button class="card__link" data-open="${p.id}">${t("card.view")} <span aria-hidden="true">→</span></button>
        </div>
      </article>`;
  }

  function render() {
    const list = filtered();
    $("#grid").innerHTML = list.map(card).join("");
    $("#empty").hidden = list.length > 0;
    $("#resultsCount").textContent = t("results.count", list.length);
    observeReveals();
  }

  const bind = (sel, key, ev = "change", parse = (v) => v) =>
    $(sel).addEventListener(ev, (e) => { state[key] = parse(e.target.type === "checkbox" ? e.target.checked : e.target.value); render(); });
  bind("#fKeyword", "keyword", "input");
  bind("#fHood", "hood");
  bind("#fType", "type");
  bind("#fSort", "sort");
  bind("#fMin", "min", "change", Number);
  bind("#fMax", "max", "change", Number);
  bind("#fWater", "water");
  bind("#fNew", "isNew");
  bind("#fFav", "fav");

  function setPills(id, v) {
    $$(`#${id} button`).forEach((b) => {
      const on = Number(b.dataset.v) === v;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", String(on));
    });
  }
  [["fBeds", "beds"], ["fBaths", "baths"]].forEach(([id, key]) => {
    $(`#${id}`).addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      state[key] = Number(b.dataset.v);
      setPills(id, state[key]);
      render();
    });
  });

  $("#moreFilters").addEventListener("click", (e) => {
    const open = $("#filtersMore").classList.toggle("is-open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });

  function syncControls() {
    $("#fKeyword").value = state.keyword;
    $("#fHood").value = state.hood;
    $("#fType").value = state.type;
    $("#fSort").value = state.sort;
    $("#fMin").value = String(state.min);
    $("#fMax").value = String(state.max);
    $("#fWater").checked = state.water;
    $("#fNew").checked = state.isNew;
    $("#fFav").checked = state.fav;
    setPills("fBeds", state.beds);
    setPills("fBaths", state.baths);
  }
  function resetState() {
    Object.assign(state, { keyword: "", hood: "", type: "", min: 0, max: 0, beds: 0, baths: 0, water: false, isNew: false, fav: false, sort: "featured" });
  }
  $("#fReset").addEventListener("click", () => { resetState(); syncControls(); render(); });

  /* Hero quick search → main filters */
  $("#quickSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    resetState();
    state.hood = $("#qHood").value;
    state.type = $("#qType").value;
    const [lo, hi] = ($("#qBudget").value || "-").split("-");
    state.min = Number(lo) || 0;
    state.max = Number(hi) || 0;
    if (state.min || state.max) $("#filtersMore").classList.add("is-open");
    syncControls();
    render();
    $("#listings").scrollIntoView({ behavior: "smooth" });
  });

  /* Grid interactions */
  $("#grid").addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) {
      const id = Number(favBtn.dataset.fav);
      favs.has(id) ? favs.delete(id) : favs.add(id);
      store.set("ap.favs", [...favs]);
      favBtn.classList.toggle("is-on", favs.has(id));
      favBtn.setAttribute("aria-pressed", String(favs.has(id)));
      if (state.fav) render();
      return;
    }
    const c = e.target.closest(".card");
    if (c) openModal(Number(c.dataset.id));
  });

  /* ---------- Neighborhoods ---------- */
  function renderAreas() {
    $("#areasGrid").innerHTML = NEIGHBORHOODS.map((n) => {
      const count = PROPERTIES.filter((p) => p.hood === n.id).length;
      return `
        <button class="area reveal" data-hood="${n.id}">
          <img src="${U(n.img, 900)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=FALLBACK_IMG" />
          <span class="area__label"><strong>${n.name}</strong><small>${t("areas.count", count)}</small></span>
        </button>`;
    }).join("");
    observeReveals();
  }
  $("#areasGrid").addEventListener("click", (e) => {
    const a = e.target.closest("[data-hood]");
    if (!a) return;
    resetState();
    state.hood = a.dataset.hood;
    syncControls();
    render();
    $("#listings").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  let current = null, imgIdx = 0;

  function showImg(i) {
    imgIdx = (i + current.images.length) % current.images.length;
    const img = $("#mImg");
    img.onerror = () => fallback(img);
    img.src = U(current.images[imgIdx], 1600);
    img.alt = `${current.title[lang]} — ${imgIdx + 1}/${current.images.length}`;
    $$("#mThumbs button").forEach((b, j) => b.classList.toggle("is-on", j === imgIdx));
  }

  function openModal(id) {
    current = PROPERTIES.find((p) => p.id === id);
    if (!current) return;
    $("#mHood").textContent = `${hoodName(current.hood)} · ${t("type." + current.type)}`;
    $("#mTitle").textContent = current.title[lang];
    $("#mAddr").textContent = current.address;
    $("#mPrice").textContent = fullMoney(current.price);
    $("#mDesc").textContent = current.desc[lang];
    $("#mSpecs").innerHTML = `
      <li>${icon.bed}<strong>${current.beds}</strong> ${t("unit.beds")}</li>
      <li>${icon.bath}<strong>${current.baths}</strong> ${t("unit.baths")}</li>
      <li>${icon.area}<strong>${current.sqft.toLocaleString("en-US")}</strong> ${t("unit.sqft")}</li>`;
    $("#mFeats").innerHTML = current.features.map((f) => `<li>${t("feat." + f)}</li>`).join("");
    $("#mThumbs").innerHTML = current.images
      .map((im, j) => `<button aria-label="${j + 1}"><img src="${U(im, 200)}" alt="" onerror="this.onerror=null;this.src=FALLBACK_IMG"/></button>`)
      .join("");
    showImg(0);
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    document.body.classList.add("no-scroll");
  }
  function closeModal() { modal.close ? modal.close() : modal.removeAttribute("open"); }
  modal.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  $("#mClose").addEventListener("click", closeModal);
  $("#mPrev").addEventListener("click", () => showImg(imgIdx - 1));
  $("#mNext").addEventListener("click", () => showImg(imgIdx + 1));
  $("#mThumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) showImg($$("#mThumbs button").indexOf(b));
  });
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showImg(imgIdx - 1);
    if (e.key === "ArrowRight") showImg(imgIdx + 1);
  });
  // swipe
  let sx = null;
  $(".modal__gallery").addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  $(".modal__gallery").addEventListener("touchend", (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) showImg(imgIdx + (dx < 0 ? 1 : -1));
    sx = null;
  });
  $("#mCta").addEventListener("click", (e) => {
    e.preventDefault();
    $("#cProperty").value = String(current.id);
    const msg = $("#cMessage");
    if (!msg.value.trim())
      msg.value = lang === "ro"
        ? `Aș dori să programez o vizionare pentru ${current.title.ro} (${current.address}).`
        : `I'd like to schedule a viewing of ${current.title.en} (${current.address}).`;
    closeModal();
    $("#contact").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#cName").focus({ preventScroll: true }), 600);
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const validators = {
    name: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: (v) => !v.trim() || /^[+()\d\s.-]{7,20}$/.test(v.trim()),
    message: (v) => v.trim().length >= 10,
    consent: (_, el) => el.checked,
  };
  function validateField(name) {
    const el = form.elements[name];
    const ok = validators[name](el.value, el);
    const err = $(`[data-err="${name}"]`, form);
    err.textContent = ok ? "" : t(`form.err.${name}`);
    el.setAttribute("aria-invalid", String(!ok));
    el.closest(".cfield, .check")?.classList.toggle("is-invalid", !ok);
    return ok;
  }
  Object.keys(validators).forEach((n) => {
    const el = form.elements[n];
    el.addEventListener("blur", () => el.getAttribute("aria-invalid") !== null && validateField(n));
    el.addEventListener("input", () => el.getAttribute("aria-invalid") === "true" && validateField(n));
    el.addEventListener("change", () => el.getAttribute("aria-invalid") === "true" && validateField(n));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#cStatus");
    status.className = "cform__status";
    status.textContent = "";
    const results = Object.keys(validators).map(validateField);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (form.elements._gotcha.value) return; // bot

    const btn = $("#cSubmit");
    btn.disabled = true;
    btn.textContent = t("form.sending");
    const data = Object.fromEntries(new FormData(form));
    delete data._gotcha;
    data.lang = lang;

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.statusText);
      } else {
        await new Promise((r) => setTimeout(r, 900));
        console.info("[demo] inquiry", data);
      }
      form.reset();
      $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
      status.classList.add("is-ok");
      status.textContent = t("form.ok");
    } catch {
      status.classList.add("is-err");
      status.textContent = t("form.fail");
    } finally {
      btn.disabled = false;
      btn.textContent = t("form.submit");
    }
  });

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Reveal + counters ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window && !reduce
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  function observeReveals() {
    $$(".reveal:not(.is-in)").forEach((el) => (io ? io.observe(el) : el.classList.add("is-in")));
  }

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = pre + target.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (target * eased).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const statsIO = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { countUp(en.target); statsIO.unobserve(en.target); }
      }), { threshold: 0.6 })
    : null;
  $$("[data-count]").forEach((el) => (statsIO ? statsIO.observe(el) : countUp(el)));

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Init ---------- */
  applyLang();
})();
