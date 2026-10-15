"use strict";
(() => {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (preference.matches) continue;
      entry.target.querySelectorAll(".motion-unit").forEach((unit, index, units) => {
        const letters = entry.target.matches("h1,h2,h3");
        const animation = unit.animate([
          { opacity: 0, transform: `translateY(${letters ? 24 : -12}px)`, filter: `blur(${letters ? 0 : 5}px)` },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
        ], { duration: letters ? 850 : 700, delay: index * Math.min(letters ? 28 : 65, 700 / units.length), easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
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
