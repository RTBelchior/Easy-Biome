/* ════════════════════════════════════════════
   DADOS DOS TERRÁRIOS — partilhado por todas as páginas
   Usa localStorage para que o terrário escolhido e os
   dados se mantenham ao navegar entre páginas.
   ════════════════════════════════════════════ */

let terrarios = [];
let activeTerrarioId =
  Number(localStorage.getItem("easybiome_active_id"));

function getActive() {
  return terrarios.find(t => t.idTerrario === activeTerrarioId)
    || terrarios[0];
}

function setActiveTerrario(id) {
  activeTerrarioId = id;
  localStorage.setItem("easybiome_active_id", id);
}