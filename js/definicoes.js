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

document.getElementById('set-preset').addEventListener('change', function(e) {
    const perfil = e.target.value;
    const tempInput = document.getElementById('set-temp-target');
    const humInput = document.getElementById('set-hum-target');

    if (perfil === 'tropical') {
        tempInput.value = "28.0";
        humInput.value = "80";
    } else if (perfil === 'desert') {
        tempInput.value = "32.0";
        humInput.value = "30";
    } else if (perfil === 'temperate') {
        tempInput.value = "22.5";
        humInput.value = "55";
    }
    
    // Aqui também podes disparar a função para enviar estes novos valores para o ESP32
});

