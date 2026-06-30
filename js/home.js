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

async function atualizarDados() {
    try {

        const terrario = getActive();

        const resposta = await fetch(
            `http://localhost:8080/api/leituras/ultima/${terrario.id}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao obter dados da API");
        }

        const dados = await resposta.json();

        terrario.temp = dados.temperatura;
        terrario.hum = dados.humidade;

        renderHero();
        renderMetrics();
        renderDevices();

    } catch (erro) {
        console.error("Erro:", erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHero();
  renderMetrics();
  renderDevices();
  renderPickerList();

  atualizarDados();
  setInterval(atualizarDados, 5000);
});