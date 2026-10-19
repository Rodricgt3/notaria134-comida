"use strict";


const form = document.querySelector("#rsvp-form");
const status = document.querySelector("#form-status");
const submit = document.querySelector("#submit-button");
const endpoint = window.INVITATION_CONFIG?.appsScriptUrl?.trim() || "";
const configured = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(endpoint);
let pendingId = "";
let pendingPayload = "";

if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
}

if (!configured) status.textContent = "Las confirmaciones estarán disponibles próximamente. Gracias por tu paciencia.";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (!configured) {
    status.textContent = "El registro aún no está habilitado. Por favor, vuelve más tarde para confirmar tu asistencia.";
    return;
  }
  const fullName = form.elements.fullName.value.trim().replace(/\s+/g, " ");
  if (fullName.length < 3) {
    status.textContent = "Escribe tu nombre completo para continuar.";
    form.elements.fullName.focus();
    return;
  }
  const signature = JSON.stringify({ fullName });
  if (pendingPayload !== signature) {
    pendingPayload = signature;
    pendingId = crypto.randomUUID();
  }
  submit.disabled = true;
  submit.textContent = "Guardando tu confirmación…";
  status.textContent = "Estamos reservando tu lugar. Espera un momento.";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let result;
    try {
      const response = await fetch(endpoint, { method: 'POST', body: new URLSearchParams({ fullName, requestId: pendingId, website: form.elements.website.value }), signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error('No fue posible contactar con el registro.');
      result = await response.json();
      if (!result.ok) throw new Error(result.error || 'No se pudo guardar tu nombre.');
      if (result.requestId !== pendingId) throw new Error('No se pudo verificar tu registro.');
    } finally { clearTimeout(timeout); }
    form.hidden = true;
    const success = document.querySelector("#success");
    success.hidden = false;
    success.querySelector('h3').textContent = result.duplicate ? 'Tu asistencia ya está registrada.' : '¡Tu asistencia quedó confirmada!';
    document.querySelector("#success-name").textContent = fullName;
    success.setAttribute("tabindex", "-1");
    success.focus();
  } catch (error) {
    status.textContent = 'No se ha podido verificar la confirmación. ' + (error.name === 'AbortError' ? 'El servicio tardó demasiado. Intenta nuevamente.' : error.message);
  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Confirmar mi asistencia <span aria-hidden="true">↗</span>';
  }
});
