(() => {
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  // Theme
  const root = document.documentElement;
  const saved = localStorage.getItem("tb-theme");
  if (saved) root.setAttribute("data-theme", saved);

  function toggleTheme(){
    const cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    const next = cur === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("tb-theme", next);
  }
  ["themeToggle", "themeToggleTop"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", toggleTheme);
  });

  // Mermaid
  if (window.mermaid) {
    try {
      mermaid.initialize({ startOnLoad: true, theme: (root.getAttribute("data-theme")==="light") ? "default" : "dark" });
    } catch(e){}
  }

  // TOC build
  const toc = $("#toc");
  const headings = $$("[data-toc='1']", $("#article"));
  const tocLinks = [];
  headings.forEach(h => {
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent.trim();
    a.className = `depth-${h.tagName === "H3" ? "3" : "2"}`;
    toc.appendChild(a);
    tocLinks.push({ id: h.id, el: a, h });
  });

  // Active section highlight
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (!ent.isIntersecting) return;
      const id = ent.target.id;
      tocLinks.forEach(x => x.el.classList.toggle("active", x.id === id));
    });
  }, { rootMargin: "-35% 0px -60% 0px", threshold: [0, 1] });

  tocLinks.forEach(x => obs.observe(x.h));

  // Progress bar
  const bar = $("#progressBar");
  function onScroll(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = `${p}%`;
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  // Search
  const search = $("#search");
  const input = $("#searchInput");
  const results = $("#searchResults");
  const openers = ["searchOpen", "searchOpenTop"].map(id => document.getElementById(id)).filter(Boolean);
  const closeEls = ["searchClose", "searchCloseBtn"].map(id => document.getElementById(id)).filter(Boolean);

  function openSearch(){
    search.hidden = false;
    input.value = "";
    renderResults("");
    setTimeout(() => input.focus(), 0);
  }
  function closeSearch(){
    search.hidden = true;
  }
  openers.forEach(b => b.addEventListener("click", openSearch));
  closeEls.forEach(b => b.addEventListener("click", closeSearch));

  function renderResults(q){
    const qq = q.trim().toLowerCase();
    results.innerHTML = "";
    const items = [];
    tocLinks.forEach(x => {
      const t = x.h.textContent.trim();
      if (!qq || t.toLowerCase().includes(qq)) items.push({ title:t, href:`#${x.id}` });
    });
    if (!items.length){
      results.innerHTML = `<div class="result">Sonuç yok.</div>`;
      return;
    }
    items.slice(0, 20).forEach(it => {
      const a = document.createElement("a");
      a.className = "result";
      a.href = it.href;
      a.innerHTML = `<strong>${escapeHtml(it.title)}</strong>`;
      a.addEventListener("click", () => closeSearch());
      results.appendChild(a);
    });
  }
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  input.addEventListener("input", () => renderResults(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    const typing = ["input","textarea"].includes(tag) || (e.target && e.target.isContentEditable);
    if (!typing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    if (!typing && e.key.toLowerCase() === "t") toggleTheme();
    if (!typing && e.key.toLowerCase() === "g") location.hash = "#top";
    if (!typing && e.key === "Escape" && !search.hidden) closeSearch();
  });

  // Code copy buttons
  $$("pre.code").forEach(pre => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "iconbtn";
    btn.style.position = "sticky";
    btn.style.float = "right";
    btn.style.top = "10px";
    btn.style.margin = "10px";
    btn.textContent = "Kopyala";
    btn.addEventListener("click", async () => {
      const code = pre.innerText;
      try{
        await navigator.clipboard.writeText(code);
        btn.textContent = "Kopyalandı";
        setTimeout(()=>btn.textContent="Kopyala", 1200);
      }catch(e){
        btn.textContent = "Olmadı";
        setTimeout(()=>btn.textContent="Kopyala", 1200);
      }
    });
    pre.prepend(btn);
  });

})();
