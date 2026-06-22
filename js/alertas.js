/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE ALERTAS (alertas.html)
   Por agora apenas inicializa o seletor de terrário;
   os alertas reais virão do endpoint /api/terrario/alertas
   ════════════════════════════════════════════ */

function onTerrarioChanged() {
  /* TODO: voltar a pedir os alertas do terrário selecionado */
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPickerList();
});
