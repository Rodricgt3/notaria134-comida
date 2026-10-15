"use strict";
(() => {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const explicitMotion = new URLSearchParams(location.search).has('animaciones');
  if (explicitMotion) document.documentElement.classList.add('force-motion');
  if (preference.matches && !explicitMotion) {
    const button = document.createElement('a');
    button.className = 'button button-gold';
    button.href = '?animaciones=si';
    button.textContent = 'Activar animaciones';
    document.querySelector('.hero-copy').append(button);
    return;
  }
  if (explicitMotion) {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.media?.mediaText.includes('prefers-reduced-motion: reduce') || rule.media?.mediaText.includes('prefers-reduced-motion:reduce')) rule.media.mediaText = 'not all';
        }
      } catch { /* External font stylesheets are not editable. */ }
    }
  }
  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (preference.matches && !explicitMotion) continue;
      entry.target.querySelectorAll(".motion-unit").forEach((unit, index, units) => {
        const letters = entry.target.matches("h1,h2,h3");
        const animation = unit.animate([
          { opacity: 0, transform: `translateY(${letters ? 40 : -24}px)`, filter: `blur(${letters ? 3 : 8}px)` },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
        ], { duration: letters ? 1200 : 1000, delay: 180 + index * Math.min(letters ? 40 : 90, 950 / units.length), easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
        active.add(animation);
        animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
      });
    }
  }, { threshold: .12 });

  document.querySelectorAll("h1,h2,h3,.intro,.gathering>p,.rsvp-copy>p,.venue-copy>p,.closing p,.eyebrow,.hero-note,.art-caption,.detail-index,.details p,.form-subtitle,.field-help,.privacy,label,footer>span").forEach(element => {
    if (element.closest("#success,[aria-live]")) return;
    const letters = element.matches("h1,h2,h3");
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement.closest("[aria-hidden],.motion-unit")) continue;
      const fragment = document.createDocumentFragment();
      for (const token of node.textContent.split(/(\s+)/u)) {
        if (!token || /^\s+$/u.test(token)) { fragment.append(token); continue; }
        const word = document.createElement("span");
        word.className = "motion-word";
        if (letters) {
          for (const char of Array.from(token)) {
            const unit = document.createElement("span");
            unit.className = "motion-unit motion-letter";
            unit.textContent = char;
            word.append(unit);
          }
        } else { word.classList.add("motion-unit"); word.textContent = token; }
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    observer.observe(element);
  });

  const artObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle("art-visible", entry.isIntersecting));
  }, { threshold: .1 });
  document.querySelectorAll(".art,.venue-art").forEach(element => artObserver.observe(element));
  document.querySelectorAll(".venue-art svg path").forEach(path => {
    path.setAttribute("pathLength", "1");
  });
  preference.addEventListener("change", event => {
    if (event.matches) { active.forEach(animation => animation.cancel()); observer.disconnect(); }
  });
})();
