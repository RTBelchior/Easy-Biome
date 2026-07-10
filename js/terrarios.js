/* ════════════════════════════════════════════
   DADOS DOS TERRÁRIOS
════════════════════════════════════════════ */

let terrarios = [];
let activeTerrarioId = Number(localStorage.getItem("easybiome_active_id"));

async function carregarTerrarios() {

    const utilizador = JSON.parse(localStorage.getItem("utilizador"));

    if (!utilizador) return;

    try {

        const resposta = await fetch(
            `${API_BASE}/terrarios/utilizador/${utilizador.idUtilizador}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao obter terrários");
        }

        terrarios = await resposta.json();

        if (terrarios.length === 0) {
            return;
        }

        if (!activeTerrarioId ||
            !terrarios.some(t => t.idTerrario === activeTerrarioId)) {

            activeTerrarioId = terrarios[0].idTerrario;

            localStorage.setItem(
                "easybiome_active_id",
                activeTerrarioId
            );
        }

        if (typeof renderPickerList === "function") {
            renderPickerList();
        }

        if (typeof onTerrarioChanged === "function") {
            onTerrarioChanged();
        }

    } catch (e) {

        console.error(e);

    }
}

function getActive() {

    if (terrarios.length === 0) {
        return null;
    }

    return terrarios.find(
        t => t.idTerrario === activeTerrarioId
    ) || terrarios[0];

}

function setActiveTerrario(id) {

    activeTerrarioId = id;

    localStorage.setItem(
        "easybiome_active_id",
        id
    );

}