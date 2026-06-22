/* ════════════════════════════════════════════
   SELETOR DE TERRÁRIO (bottom sheet)
   Usado pelo botão de troca presente em todas as páginas.
   ════════════════════════════════════════════ */

function renderPickerList() {
  const list = document.getElementById('picker-list');
  if (!list) return;
  list.innerHTML = terrarios.map(t => `
    <div class="picker-item ${t.id===activeTerrarioId?'active':''}" onclick="onPickTerrario(${t.id})">
      <img src="${t.img}" alt="">
      <div>
        <div class="picker-item-name">${t.nome}</div>
        <div class="picker-item-sub">${t.temp.toFixed(1)}°C · ${Math.round(t.hum)}%</div>
      </div>
      ${t.id===activeTerrarioId ? '<svg class="picker-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
    </div>
  `).join('');
}

function openTerrarioPicker() {
  renderPickerList();
  document.getElementById('picker-overlay').classList.add('open');
}

function closeTerrarioPicker(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('picker-overlay').classList.remove('open');
}

function addTerrario() {
  const name = prompt('Nome do novo terrário:');
  if (!name || !name.trim()) return;
  const id = addTerrarioData(name.trim());
  onPickTerrario(id);
}

/* Cada página define a sua própria onPickTerrario() para
   re-renderizar o que precisa; por defeito só troca e recarrega. */
function onPickTerrario(id) {
  setActiveTerrario(id);
  if (typeof onTerrarioChanged === 'function') {
    onTerrarioChanged();
    renderPickerList();
    closeTerrarioPicker();
  } else {
    location.reload();
  }
}
