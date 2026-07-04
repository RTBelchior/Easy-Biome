/* ═══════════════════════════════════════════════
   EASYBIOME — ATIVIDADE
   ═══════════════════════════════════════════════ */

let atividades = [];

/* ───────────────────────────────────────────── */
/* Atualiza quando muda o terrário              */
/* ───────────────────────────────────────────── */

function onTerrarioChanged() {
    carregarAtividade();
}

/* ───────────────────────────────────────────── */
/* Obtém atividade da API                       */
/* ───────────────────────────────────────────── */

async function carregarAtividade() {

    try {

        const terrario = getActive();

        const resposta = await fetch(
            `http://localhost:8080/api/logs/terrario/${terrario.id}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao obter atividade.");
        }

        atividades = await resposta.json();

        renderAtividade();

    } catch (e) {

        console.error(e);

        document.getElementById("atividade-list").innerHTML =
            `<div class="sem-atividade">
                Não foi possível carregar a atividade.
            </div>`;

    }

}

/* ───────────────────────────────────────────── */
/* Renderização                                 */
/* ───────────────────────────────────────────── */

function renderAtividade() {

    const container = document.getElementById("atividade-list");

    if (!atividades.length) {

        container.innerHTML =
            `<div class="sem-atividade">
                Ainda não existe atividade registada.
            </div>`;

        return;
    }

    let html = "";

    let ultimaData = "";

    atividades.forEach(log => {

        const data = new Date(log.executadoEm);

        const dia = obterTituloData(data);

        if (dia !== ultimaData) {

            html += `
                <div class="data-header">
                    ${dia}
                </div>
            `;

            ultimaData = dia;
        }

        const info = obterInfoAcao(log);

        html += `

        <div class="atividade-card">

            <div class="atividade-icon ${info.classe}">
                ${info.icone}
            </div>

            <div class="atividade-info">

                <div class="atividade-titulo">
                    ${info.titulo}
                </div>

                <div class="atividade-dispositivo">
                    ${log.nomeDispositivo}
                </div>

                <div class="atividade-footer">

                    <span class="origem">
                        ${traduzirOrigem(log.origemLog)}
                    </span>

                    <span>
                        ${formatarHora(data)}
                    </span>

                </div>

            </div>

        </div>

        `;

    });

    container.innerHTML = html;

}

/* ───────────────────────────────────────────── */

function obterInfoAcao(log) {

    switch (log.acao) {

        case "LIGAR":
            return {
                icone: "🟢",
                classe: "icon-ligar",
                titulo: "Dispositivo ligado"
            };

        case "DESLIGAR":
            return {
                icone: "🔴",
                classe: "icon-desligar",
                titulo: "Dispositivo desligado"
            };

        case "MODO_MANUAL":
            return {
                icone: "⚙️",
                classe: "icon-manual",
                titulo: "Modo manual ativado"
            };

        case "MODO_AUTOMATICO":
            return {
                icone: "♻️",
                classe: "icon-auto",
                titulo: "Modo automático ativado"
            };

        default:
            return {
                icone: "ℹ️",
                classe: "",
                titulo: log.acao
            };

    }

}

/* ───────────────────────────────────────────── */

function traduzirOrigem(origem) {

    switch (origem) {

        case "APP":
            return "Aplicação";

        case "AUTOMATICO":
            return "Automático";

        case "ESP32":
            return "ESP32";

        default:
            return origem;

    }

}

/* ───────────────────────────────────────────── */

function formatarHora(data) {

    return data.toLocaleTimeString("pt-PT", {

        hour: "2-digit",
        minute: "2-digit"

    });

}

/* ───────────────────────────────────────────── */

function obterTituloData(data) {

    const hoje = new Date();

    const ontem = new Date();

    ontem.setDate(hoje.getDate() - 1);

    if (mesmoDia(data, hoje))
        return "Hoje";

    if (mesmoDia(data, ontem))
        return "Ontem";

    return data.toLocaleDateString("pt-PT", {

        day: "2-digit",
        month: "2-digit",
        year: "numeric"

    });

}

/* ───────────────────────────────────────────── */

function mesmoDia(a, b) {

    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();

}

/* ───────────────────────────────────────────── */
/* Arranque                                     */
/* ───────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    renderPickerList();

    carregarAtividade();

});