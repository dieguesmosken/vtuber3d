export function createDebugPanel(el) {
  let last = 0;
  return (data, ms, extra = '') => {
    const now = performance.now();
    if (now - last < 100) return; // atualiza o painel a 10 Hz para não pesar
    last = now;
    if (!data.found) { el.textContent = 'Nenhum rosto detectado'; return; }
    const rows = Object.entries(data.blend)
      .map(([k, v]) => `<div class="row"><span style="width:150px">${k}</span>` +
        `<div class="bar" style="width:${Math.round(v * 120)}px"></div><span>${v.toFixed(2)}</span></div>`)
      .join('');
    el.innerHTML = `<b>inferência: ${ms.toFixed(1)} ms</b> ${extra}<br>${rows}`;
  };
}
