/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA INICIAL (index.html)
   ════════════════════════════════════════════ */

function renderHero() {
  const t = getActive();
  document.getElementById('terrario-img').src = t.img;
  document.getElementById('terrario-name').textContent = t.nome;
}

function renderMetrics() {
  const t = getActive();
  const tw = t.temp > t.tempRange[1] || t.temp < t.tempRange[0];
  const hw = t.hum < t.humRange[0] || t.hum > t.humRange[1];

  document.getElementById('temp-val').innerHTML = t.temp.toFixed(1) + '<span class="unit">°C</span>';
  document.getElementById('temp-val').className = 'm-val ' + (tw ? 'warn' : 'ok');
  document.getElementById('temp-card').className = 'm-card' + (tw ? ' warn-border' : '');
  document.getElementById('temp-hint').className = 'm-hint' + (tw ? ' warn' : '');
  document.getElementById('temp-hint').textContent = tw ? 'Fora dos limites!' : `Normal · ${t.tempRange[0]}–${t.tempRange[1]}°C`;

  document.getElementById('hum-val').innerHTML = Math.round(t.hum) + '<span class="unit">%</span>';
  document.getElementById('hum-val').className = 'm-val ' + (hw ? 'warn' : 'ok');
  document.getElementById('hum-card').className = 'm-card' + (hw ? ' warn-border' : '');
  document.getElementById('hum-hint').className = 'm-hint' + (hw ? ' warn' : '');
  document.getElementById('hum-hint').textContent = hw
    ? (t.hum < t.humRange[0] ? 'Abaixo do limite' : 'Acima do limite')
    : `Normal · ${t.humRange[0]}–${t.humRange[1]}%`;
}

function renderDevices() {
  const t = getActive();
  ['fan', 'heat', 'light'].forEach(key => {
    const on = t[key];
    document.getElementById(key + '-t').classList.toggle('on', on);
    document.getElementById(key + '-icon').classList.toggle('on', on);
    const labels = {
      fan:   on ? 'A ventilar'       : 'Desligada',
      heat:  on ? 'Ligada · Relé OK' : 'Desligada',
      light: on ? 'Ligada'           : 'Desligada'
    };
    document.getElementById(key + '-sub').textContent = labels[key];
  });
}

function toggleDev(key) {
  const t = getActive();
  t[key] = !t[key];
  saveTerrarios();
  renderDevices();
}

/* chamada pelo picker.js quando o utilizador troca de terrário */
function onTerrarioChanged() {
  renderHero();
  renderMetrics();
  renderDevices();
}

/* ── Simulação de sensores (substituir pelas chamadas reais à API) ── */
function startSensorSimulation() {
  setInterval(() => {
    const t = getActive();
    t.temp = Math.max(t.tempRange[0] - 3, Math.min(t.tempRange[1] + 3, t.temp + (Math.random() - .5) * .5));
    t.hum  = Math.max(t.humRange[0] - 8, Math.min(t.humRange[1] + 8, t.hum + (Math.random() - .5) * .8));
    saveTerrarios();
    renderMetrics();
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHero();
  renderMetrics();
  renderDevices();
  renderPickerList();
  startSensorSimulation();
});
