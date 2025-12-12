(() => {
  const btn = document.querySelector('.to-top');
  const onScroll = () => {
    if (!btn) return;
    if (window.scrollY > 600) btn.classList.add('show');
    else btn.classList.remove('show');
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  btn?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Add copy buttons to code blocks
  document.querySelectorAll('pre.code').forEach((pre) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Kopyala';
    b.className = 'copy-btn';
    b.addEventListener('click', async () => {
      try{
        const text = pre.innerText;
        await navigator.clipboard.writeText(text);
        b.textContent = 'Kopyalandı';
        setTimeout(() => (b.textContent = 'Kopyala'), 1000);
      }catch(e){
        b.textContent = 'Olmadı';
        setTimeout(() => (b.textContent = 'Kopyala'), 1000);
      }
    });
    pre.style.position = 'relative';
    b.style.position = 'absolute';
    b.style.top = '10px';
    b.style.right = '10px';
    b.style.padding = '8px 10px';
    b.style.borderRadius = '12px';
    b.style.border = '1px solid rgba(255,255,255,.22)';
    b.style.background = 'rgba(255,255,255,.10)';
    b.style.color = 'inherit';
    b.style.cursor = 'pointer';
    b.style.backdropFilter = 'blur(10px)';
    pre.appendChild(b);
  });
})();
