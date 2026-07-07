/* ==========================================================
   EASYBIOME - ATIVIDADE
   ========================================================== */

let atividades = [];
let atividadesFiltradas = [];

let filtroOrigem = "TODOS";
let filtroDispositivo = "TODOS";

const nomesDispositivos = {
    1: "🌀 Ventoinha",
    2: "🔥 Aquecimento",
    3: "💡 Iluminação",
    4: "💧 Humidificador"
};

const tiposDispositivos = {
    1: "VENTOINHA",
    2: "LAMPADA_AQUECIMENTO",
    3: "LAMPADA_ILUMINACAO",
    4: "HUMIDIFICADOR"
};

/* ========================================================== */

function onTerrarioChanged() {
    carregarAtividade();
}

/* ========================================================== */

async function carregarAtividade() {

    try {

        const terrario = getActive();

        const resposta = await fetch(
            `${API_BASE}/logs/terrario/${terrario.id}`
        );

        if (!resposta.ok)
            throw new Error();

        atividades = await resposta.json();

        atividadesFiltradas = [...atividades];

        renderizar();

    } catch {

        document.getElementById("atividade-list").innerHTML =
            `<div class="loading">
                Não foi possível carregar a atividade.
            </div>`;
    }
}

/* ========================================================== */

function selecionarFiltro(chip) {

    const grupo = chip.dataset.group;
    const valor = chip.dataset.value;

    document
        .querySelectorAll(`.filter-chip[data-group="${grupo}"]`)
        .forEach(c => c.classList.remove("active"));

    chip.classList.add("active");

    if (grupo === "origem")
        filtroOrigem = valor;
    else
        filtroDispositivo = valor;

    filtrarAtividade();
}

/* ========================================================== */

function filtrarAtividade() {

    const texto = document
        .getElementById("pesquisa")
        .value
        .toLowerCase();

    atividadesFiltradas = atividades.filter(a => {

        const nome =
            (nomesDispositivos[a.idDispositivo] || "")
                .toLowerCase();

        const tipo =
            tiposDispositivos[a.idDispositivo];

        const origemOK =
            filtroOrigem === "TODOS"
            || a.origemLog === filtroOrigem;

        const dispositivoOK =
            filtroDispositivo === "TODOS"
            || tipo === filtroDispositivo;

        const pesquisaOK =
            nome.includes(texto);

        return origemOK && dispositivoOK && pesquisaOK;

    });

    renderizar();
}

/* ========================================================== */

function renderizar() {

    const lista = document.getElementById("atividade-list");

    if (atividadesFiltradas.length === 0) {

        lista.innerHTML = `
            <div class="loading">
                Nenhuma atividade encontrada.
            </div>
        `;

        return;
    }

    lista.innerHTML = atividadesFiltradas
        .map(criarCard)
        .join("");
}

/* ========================================================== */

function criarCard(log) {

    const dispositivo =
        nomesDispositivos[log.idDispositivo] || "Dispositivo";

    const data = new Date(log.executadoEm);

    const hora = data.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const dia = data.toLocaleDateString("pt-PT");

    let badgeOrigem = "";
    let badgeAcao = "";

    switch (log.origemLog) {

        case "APP":
            badgeOrigem = `<span class="badge app">APP</span>`;
            break;

        case "AUTOMATICO":
            badgeOrigem = `<span class="badge auto">AUTOMÁTICO</span>`;
            break;

        default:
            badgeOrigem = `<span class="badge esp">ESP32</span>`;
    }

    switch (log.acao) {

        case "LIGAR":
            badgeAcao = `<span class="badge on">🟢 Ligado</span>`;
            break;

        case "DESLIGAR":
            badgeAcao = `<span class="badge off">🔴 Desligado</span>`;
            break;

        case "MODO_MANUAL":
            badgeAcao = `<span class="badge manual">⚙️ Manual</span>`;
            break;

        case "MODO_AUTOMATICO":
            badgeAcao = `<span class="badge auto-mode">🤖 Automático</span>`;
            break;

        default:
            badgeAcao = `<span class="badge">${log.acao}</span>`;
    }

    return `

        <div class="activity-card">

            <div class="activity-top">

                <div class="activity-device">
                    ${dispositivo}
                </div>

                <div class="activity-time">
                    ${hora}<br>${dia}
                </div>

            </div>

            <div class="activity-action">

                Estado anterior:
                <strong>${log.estadoAnterior ? "Ligado" : "Desligado"}</strong>

                →

                <strong>${log.estadoNovo ? "Ligado" : "Desligado"}</strong>

            </div>

            <div class="activity-footer">

                ${badgeAcao}

                ${badgeOrigem}

            </div>

        </div>

    `;
}

/* ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    renderPickerList();

    carregarAtividade();

});