/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE DEFINIÇÕES (definicoes.html)
   ════════════════════════════════════════════ */

function renderSettings() {
  const t = getActive();
  document.getElementById('set-nome').textContent = t.nome;
  document.getElementById('set-temp').textContent = `${t.tempRange[0]}–${t.tempRange[1]}°C`;
  document.getElementById('set-hum').textContent = `${t.humRange[0]}–${t.humRange[1]}%`;
}

function onTerrarioChanged() {
  renderSettings();
  renderPickerList();
  closeTerrarioPicker();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPickerList();
  renderSettings();
});
