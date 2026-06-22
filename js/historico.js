/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE HISTÓRICO (historico.html)
   ════════════════════════════════════════════ */

const histData = [];

function onTerrarioChanged() {
  histData.length = 0;
  renderHistList();
  chartsDrawn = false;
  initCharts();
}

function renderHistList() {
  const el = document.getElementById('hist-list');
  if (!el) return;
  el.innerHTML = [...histData].reverse().slice(0, 8).map(r => {
    const t = getActive();
    const tw = r.t > t.tempRange[1] || r.t < t.tempRange[0];
    const hw = r.h < t.humRange[0] || r.h > t.humRange[1];
    return `<div class="hist-row">
      <div class="hist-time">${r.ts}</div>
      <div class="hist-vals">
        <div class="hist-val ${tw ? 'warn' : 'ok'}">${r.t}°C</div>
        <div class="hist-val ${hw ? 'warn' : 'ok'}">${r.h}%</div>
      </div>
    </div>`;
  }).join('');
}

function filterHist(el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  /* TODO: ligar este filtro ao endpoint /api/terrario/dados/historico */
}

/* ── Gráficos em canvas (sem dependências externas) ── */
let chartsDrawn = false;

function initCharts() {
  if (chartsDrawn) return;
  chartsDrawn = true;
  const t = getActive();
  drawChart('chart-temp', generateData(24, t.tempRange[0], t.tempRange[1]), '#3DBA7E');
  drawChart('chart-hum', generateData(24, t.humRange[0], t.humRange[1]), '#D4A03A');
}

function generateData(n, min, max) {
  return Array.from({ length: n }, () => +(min + Math.random() * (max - min)).toFixed(1));
}

function drawChart(id, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth;
  const h = 120;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { l: 8, r: 8, t: 8, b: 8 };
  const cw = w - pad.l - pad.r;
  const mn = Math.min(...data) - 2, mx = Math.max(...data) + 2;
  const xStep = cw / (data.length - 1);
  const yScale = v => (h - pad.t - pad.b) - ((v - mn) / (mx - mn)) * (h - pad.t - pad.b) + pad.t;
  const xPos = i => pad.l + i * xStep;

  const grad = ctx.createLinearGradient(0, pad.t, 0, h);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(xPos(0), yScale(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yScale(v)); });
  ctx.lineTo(xPos(data.length - 1), h);
  ctx.lineTo(xPos(0), h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(xPos(0), yScale(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yScale(v)); });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPickerList();
  renderHistList();
  initCharts();
});
