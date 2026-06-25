/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE PERFIL (profile.html)
   ════════════════════════════════════════════ */

function renderProfile() {
  const terrario = getActive();
  const deviceCount = [terrario.fan, terrario.heat, terrario.light].filter(Boolean).length;

  document.getElementById('profile-terra-name').textContent = terrario.nome;
  document.getElementById('profile-terra-temp').textContent = `${terrario.tempRange[0]}–${terrario.tempRange[1]}°C`;
  document.getElementById('profile-terra-hum').textContent = `${terrario.humRange[0]}–${terrario.humRange[1]}%`;
  document.getElementById('profile-terra-devices').textContent = `${deviceCount}/3 dispositivos ativos`;
  document.getElementById('profile-terra-ip').textContent = '192.168.1.42';
  document.getElementById('profile-terra-power').textContent = terrario.light ? 'Iluminação ligada' : 'Iluminação em espera';
}

function onTerrarioChanged() {
  renderProfile();
  renderPickerList();
  closeTerrarioPicker();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPickerList();
  renderProfile();
});