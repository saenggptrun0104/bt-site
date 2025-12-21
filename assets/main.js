(() => {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

  // year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // Nav pill
  const nav = $(".nav");
  const pill = $(".nav__pill");
  const links = $$(".nav__link, .nav__cta");

  const sections = ["reviews","services","works","steps","contact"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function movePillTo(el){
    if (!pill || !nav || !el) return;
    const r = el.getBoundingClientRect();
    const nr = nav.getBoundingClientRect();
    pill.style.width = `${Math.max(46, r.width)}px`;
    pill.style.transform = `translateX(${(r.left - nr.left)}px)`;
  }
  requestAnimationFrame(() => movePillTo(links[0]));

  // Smooth scroll on click only
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function smoothScrollTo(y, duration=650){
    const start = window.scrollY;
    const change = y - start;
    const startTime = performance.now();
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    function anim(now){
      const t = clamp((now - startTime) / duration, 0, 1);
      window.scrollTo(0, start + change * easeOutCubic(t));
      if (t < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }

  function scrollToHash(hash){
    const id = (hash || "").replace("#","");
    const target = document.getElementById(id);
    if (!target) return;
    const headerOffset = 92;
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    smoothScrollTo(y);
  }

  links.forEach(a => {
    a.addEventListener("mouseenter", () => movePillTo(a));
    a.addEventListener("focus", () => movePillTo(a));
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) {
        e.preventDefault();
        movePillTo(a);
        history.pushState(null, "", href);
        scrollToHash(href);
      }
    });
  });

  // Follow section
  const linkById = {};
  links.forEach(a => {
    const h = a.getAttribute("href") || "";
    if (h.startsWith("#")) linkById[h.slice(1)] = a;
  });

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const a = linkById[visible.target.id];
    if (a) movePillTo(a);
  }, { threshold: [0.25, 0.35, 0.5], rootMargin: "-15% 0px -55% 0px" });

  sections.forEach(s => io.observe(s));

  // Works filter
  const chips = $$(".chip");
  const works = $$(".work");
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      chips.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      works.forEach(w => {
        const cat = w.dataset.cat;
        w.style.display = (f === "all" || f === cat) ? "" : "none";
      });
    });
  });

  // Tiles parallax (ใช้ CSS variables ไม่ทับ 3D)
  const tiles = $$(".tile");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && tiles.length) {
    let mx=0, my=0, tx=0, ty=0;

    window.addEventListener("mousemove", (e) => {
      const cx = innerWidth/2, cy = innerHeight/2;
      mx = (e.clientX - cx)/55;
      my = (e.clientY - cy)/55;
    }, { passive:true });

    const raf = () => {
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;

      const s = scrollY || 0;
      tiles.forEach((el, i) => {
        const k = (i % 3 + 1) * 0.6;
        const yy = (ty * k) + Math.sin((s/650) + i) * 2.5;
        const xx = (tx * k);

        el.style.setProperty("--tx", `${xx}px`);
        el.style.setProperty("--ty", `${yy}px`);
      });

      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  if (location.hash) setTimeout(() => scrollToHash(location.hash), 60);
})();
