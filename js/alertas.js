/* ════════════════════════════════════════════
   ALERTAS
   ════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", async () => {
  renderPickerList();
  await carregarAlertas();
});

async function onTerrarioChanged() {
  await carregarAlertas();
}

async function carregarAlertas() {

  const terrario = getActive();

  if (!terrario) return;

  try {

    const resposta = await fetch(
      `${API_BASE}/alertas/terrario/${terrario.idTerrario}`
    );

    if (!resposta.ok)
      throw new Error("Erro ao obter alertas.");

    const alertas = await resposta.json();

    renderAlertas(alertas);

  } catch (erro) {

    console.error(erro);

    document.getElementById("alert-list").innerHTML = `
        <div class="alert-row">
            <div class="alert-body">
                <div class="alert-title">
                    Erro ao carregar os alertas.
                </div>
            </div>
        </div>
    `;

  }

}

function renderAlertas(alertas) {

  const lista = document.getElementById("alert-list");

  lista.innerHTML = "";

  if (alertas.length === 0) {

    lista.innerHTML = `
            <div class="alert-row ok">
                <div class="alert-body">
                    <div class="alert-title">
                        Não existem alertas.
                    </div>
                </div>
            </div>
        `;

    return;
  }

  alertas.forEach(alerta => {

    lista.innerHTML += `

        <div class="alert-row ${alerta.resolvidoAlerta ? "ok" : "unread"}">

            <div class="alert-icon ${alerta.resolvidoAlerta ? "ok-bg" : "warn-bg"}">

                ${alerta.resolvidoAlerta
        ?
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>`
        :
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>`
      }

            </div>

            <div class="alert-body">

                <div class="alert-title">
                    ${formatarTipo(alerta.tipoAlerta)}
                </div>

                <div class="alert-desc">
                    ${alerta.mensagemAlerta}
                </div>

                <div class="alert-time">
                    ${new Date(alerta.criadoEm).toLocaleString("pt-PT")}
                </div>

                <div style="margin-top:6px">
                    <span class="alert-badge ${alerta.resolvidoAlerta ? "resolved" : "unresolved"}">
                        ${alerta.resolvidoAlerta ? "Resolvido" : "Por resolver"}
                    </span>
                </div>

            </div>

        </div>

        `;

  });

}

function formatarTipo(tipo) {

  const tipos = {
    TEMPERATURA_ALTA: "Temperatura elevada",
    TEMPERATURA_BAIXA: "Temperatura baixa",
    HUMIDADE_ALTA: "Humidade elevada",
    HUMIDADE_BAIXA: "Humidade baixa",
    DISPOSITIVO_FALHA: "Falha de dispositivo"
  };

  return tipos[tipo] || tipo;
}