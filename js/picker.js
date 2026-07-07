/* ════════════════════════════════════════════
   SELETOR DE TERRÁRIO (bottom sheet)
   Usado pelo botão de troca presente em todas as páginas.
   ════════════════════════════════════════════ */

function renderPickerList() {
  const list = document.getElementById('picker-list');
  if (!list) return;
  list.innerHTML = terrarios.map(t => `
<div class="picker-item ${t.idTerrario === activeTerrarioId ? 'active' : ''}"
     onclick="onPickTerrario(${t.idTerrario})">

    <img src="${t.imagemTerrario || 'imagens/terrario-default.jpg'}">

    <div>
        <div class="picker-item-name">${t.nome}</div>

        <div class="picker-item-sub">
            ${t.tempTerrarioMin}°C - ${t.tempTerrarioMax}°C
        </div>
    </div>

    ${t.idTerrario === activeTerrarioId
      ? `<svg class="picker-check" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
           </svg>`
      : ""
    }

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
    abrirModalTerrario();
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

window.addEventListener("load", carregarTerrarios);