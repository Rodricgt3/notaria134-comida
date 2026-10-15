"use strict";
(() => {
  const clock = document.querySelector('#countdown');
  if (!clock) return;
  const target = Date.parse(clock.dataset.event);
  const units = ['days', 'hours', 'minutes', 'seconds'];
  let timer;
  function update() {
    const seconds = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    units.forEach((unit, index) => {
      const node = clock.querySelector(`[data-part="${unit}"]`);
      const value = String(values[index]).padStart(2, '0');
      if (node.textContent !== value) node.textContent = value;
    });
    if (!seconds) {
      document.querySelector('#countdown-note').textContent = '¡Llegó el momento de celebrar juntos!';
      clearInterval(timer);
    }
  }
  timer = setInterval(update, 1000);
  update();
  document.addEventListener('visibilitychange', update);
})();
