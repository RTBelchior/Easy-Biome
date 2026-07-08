/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE HISTÓRICO
   ════════════════════════════════════════════ */

const histData = [];
let horasFiltro = 1;

function onTerrarioChanged() {
    atualizarHistorico();
}

/* ────────────────────────────────────────── */
/* Obtém o histórico da API                   */
/* ────────────────────────────────────────── */

async function atualizarHistorico() {

    try {

        const terrario = getActive();

        const resposta = await fetch(
            `${API_BASE}/leituras/historico/${terrario.idTerrario}?horas=${horasFiltro}`
        );

        if (!resposta.ok)
            throw new Error("Erro ao obter histórico");

        const leituras = await resposta.json();

        histData.length = 0;

        leituras.forEach(l => {

            histData.push({
                t: l.temperatura,
                h: l.humidade,
                ts: new Date(l.registadoEm).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            });

        });

        renderHistList();
        desenharGraficos();

    } catch (erro) {
        console.error("Erro:", erro);
    }

}

/* ────────────────────────────────────────── */
/* Lista                                      */
/* ────────────────────────────────────────── */

function renderHistList() {

    const el = document.getElementById("hist-list");

    if (!el) return;

    const t = getActive();

    el.innerHTML = [...histData].reverse().map(r => {

        const tw =
            r.t < t.tempTerrarioMin ||
            r.t > t.tempTerrarioMax;

        const hw =
            r.h < t.humidadeTerrarioMin ||
            r.h > t.humidadeTerrarioMax;

        return `
        <div class="hist-row">
            <div class="hist-time">${r.ts}</div>

            <div class="hist-vals">
                <div class="hist-val ${tw ? "warn" : "ok"}">
                    ${r.t.toFixed(1)}°C
                </div>

                <div class="hist-val ${hw ? "warn" : "ok"}">
                    ${Math.round(r.h)}%
                </div>
            </div>
        </div>
        `;

    }).join("");

}

/* ────────────────────────────────────────── */
/* Filtros                                    */
/* ────────────────────────────────────────── */

function filterHist(el) {

    document
        .querySelectorAll(".filter-chip")
        .forEach(c => c.classList.remove("active"));

    el.classList.add("active");

    switch (el.textContent.trim()) {

        case "1h":
            horasFiltro = 1;
            break;

        case "6h":
            horasFiltro = 6;
            break;

        case "24h":
            horasFiltro = 24;
            break;

        case "7 dias":
            horasFiltro = 168;
            break;
    }

    atualizarHistorico();

}

/* ────────────────────────────────────────── */
/* Gráficos                                   */
/* ────────────────────────────────────────── */

function desenharGraficos() {

    drawChart(
        "chart-temp",
        histData.map(x => x.t),
        "#3DBA7E"
    );

    drawChart(
        "chart-hum",
        histData.map(x => x.h),
        "#D4A03A"
    );

}

function drawChart(id, data, color) {

    const canvas = document.getElementById(id);

    if (!canvas || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;

    const w = canvas.parentElement.clientWidth;
    const h = 120;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");

    ctx.scale(dpr, dpr);

    const pad = {
        l: 8,
        r: 8,
        t: 8,
        b: 8
    };

    const cw = w - pad.l - pad.r;

    const mn = Math.min(...data) - 2;
    const mx = Math.max(...data) + 2;

    const xStep = cw / (data.length - 1 || 1);

    const xPos = i => pad.l + i * xStep;

    const yPos = v =>
        (h - pad.t - pad.b)
        - ((v - mn) / (mx - mn || 1))
        * (h - pad.t - pad.b)
        + pad.t;

    const grad = ctx.createLinearGradient(0, pad.t, 0, h);

    grad.addColorStop(0, color + "44");
    grad.addColorStop(1, color + "00");

    ctx.beginPath();

    ctx.moveTo(xPos(0), yPos(data[0]));

    data.forEach((v, i) => {
        if (i > 0)
            ctx.lineTo(xPos(i), yPos(v));
    });

    ctx.lineTo(xPos(data.length - 1), h);
    ctx.lineTo(xPos(0), h);

    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(xPos(0), yPos(data[0]));

    data.forEach((v, i) => {
        if (i > 0)
            ctx.lineTo(xPos(i), yPos(v));
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    const pontos = [];

    data.forEach((v, i) => {
        pontos.push({
            x: xPos(i),
            y: yPos(v),
            value: v,
            time: histData[i].ts
        });
    });

    ctx.stroke();

    const tooltip = document.getElementById(
        id === "chart-temp"
            ? "tooltip-temp"
            : "tooltip-hum"
    );

    canvas.onmousemove = function (e) {

        const rect = canvas.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;

        let maisPerto = pontos[0];

        pontos.forEach(p => {
            if (Math.abs(p.x - mouseX) < Math.abs(maisPerto.x - mouseX)) {
                maisPerto = p;
            }
        });

        // redesenha o gráfico
        desenharGraficos();

        // bolinha
        ctx.beginPath();
        ctx.arc(maisPerto.x, maisPerto.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        tooltip.style.display = "block";
        tooltip.style.left = maisPerto.x + "px";
        tooltip.style.top = maisPerto.y + "px";

        tooltip.innerHTML =
            id === "chart-temp"
                ? `<strong>${maisPerto.value.toFixed(1)} °C</strong><br>${maisPerto.time}`
                : `<strong>${Math.round(maisPerto.value)} %</strong><br>${maisPerto.time}`;
    };

    canvas.onmouseleave = function () {

        tooltip.style.display = "none";

        desenharGraficos();
    };

}

/* ────────────────────────────────────────── */
/* Arranque                                   */
/* ────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    renderPickerList();

    atualizarHistorico();

});