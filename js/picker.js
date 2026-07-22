/* ════════════════════════════════════════════
   SELETOR DE TERRÁRIO (bottom sheet)
   Usado pelo botão de troca presente em todas as páginas.
   ════════════════════════════════════════════ */

function renderPickerList() {

  const list = document.getElementById('picker-list');

  if (!list) return;

  list.innerHTML = terrarios.map(t => {

    let imagem = t.imagemTerrario;

    // Se não existir imagem
    if (!imagem) {
      imagem = "terrarioGrande.jpg";
    }

    // Imagens enviadas pelo utilizador
    if (imagem.startsWith("uploads/")) {

      // Remove "uploads/" para não ficar:
      // /uploads/uploads/imagem.jpg
      const nomeImagem = imagem.replace(/^uploads\//, "");

      imagem = `${SERVER_BASE}/${nomeImagem}`;
    }

    // Se vier apenas o nome do ficheiro
    else if (
      imagem &&
      !imagem.startsWith("http://") &&
      !imagem.startsWith("https://") &&
      !imagem.startsWith("imagens/")
    ) {

      imagem = `${SERVER_BASE}/${imagem}`;
    }

    return `
      <div class="picker-item ${t.idTerrario === activeTerrarioId ? 'active' : ''}"
           onclick="onPickTerrario(${t.idTerrario})">

        <img 
          class="picker-img"
          src="${imagem}"
          alt="${t.nomeTerrario || t.nome || 'Terrário'}"
        >

        <div class="picker-info">

          <div class="picker-item-name">
            ${t.nomeTerrario || t.nome}
          </div>

          <div class="picker-item-sub">
            🌡️ ${t.tempTerrarioMin}°C – ${t.tempTerrarioMax}°C
          </div>

        </div>

        ${t.idTerrario === activeTerrarioId
          ? `<div class="picker-check">✓</div>`
          : ""}

      </div>
    `;
  }).join("");
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