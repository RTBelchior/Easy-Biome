/* ════════════════════════════════════════════
   EASYBIOME - ALERTAS
   ════════════════════════════════════════════ */

   let todosOsAlertas = [];

document.addEventListener("DOMContentLoaded", async () => {
  verificarSessao();
  renderPickerList();

  document
    .getElementById("filtro-estado")
    .addEventListener("change", aplicarFiltros);

  document
    .getElementById("filtro-tipo")
    .addEventListener("change", aplicarFiltros);

  document
    .getElementById("filtro-data")
    .addEventListener("change", aplicarFiltros);

  document
    .getElementById("limpar-filtros")
    .addEventListener("click", limparFiltros);

  await carregarAlertas();


});


async function onTerrarioChanged() {

  // Limpar filtros
  document.getElementById("filtro-estado").value = "todos";
  document.getElementById("filtro-tipo").value = "todos";
  document.getElementById("filtro-data").value = "todos";

  await carregarAlertas();

}


async function carregarAlertas() {

  const terrario = getActive();

  if (!terrario) return;

  try {

    const resposta = await fetch(
      `${API_BASE}/alertas/terrario/${terrario.idTerrario}`
    );

    if (!resposta.ok) {
      throw new Error("Erro ao obter alertas.");
    }

    todosOsAlertas = await resposta.json();

    aplicarFiltros();

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

  if (!lista) return;

  lista.innerHTML = "";


  if (!alertas || alertas.length === 0) {

    lista.innerHTML = `
      <div class="alert-row ok">

        <div class="alert-icon ok-bg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div class="alert-body">

          <div class="alert-title">
            Não existem alertas.
          </div>

          <div class="alert-desc">
            Este terrário não possui alertas registados.
          </div>

        </div>

      </div>
    `;

    return;
  }


  alertas.forEach(alerta => {

    const resolvido = alerta.resolvidoAlerta === true;

    lista.innerHTML += `

      <div class="alert-row ${resolvido ? "ok" : "unread"}">

        <div class="alert-icon ${resolvido ? "ok-bg" : "warn-bg"}">

          ${
            resolvido

            ?

            `<svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12"/>
            </svg>`

            :

            `<svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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


          ${
            alerta.valorAlerta !== null &&
            alerta.valorAlerta !== undefined

            ?

            `<div class="alert-desc">
              Valor registado: ${alerta.valorAlerta}
            </div>`

            :

            ""
          }


          ${
            alerta.limiteAlerta !== null &&
            alerta.limiteAlerta !== undefined

            ?

            `<div class="alert-desc">
              Limite: ${alerta.limiteAlerta}
            </div>`

            :

            ""
          }


          <div class="alert-time">
            ${formatarData(alerta.criadoEm)}
          </div>


          <div style="margin-top:6px">

            <span class="alert-badge ${resolvido ? "resolved" : "unresolved"}">

              ${resolvido ? "Resolvido" : "Por resolver"}

            </span>

          </div>

        </div>

      </div>

    `;

  });

}


function formatarTipo(tipo) {

  const tipos = {

    TEMPERATURA_ALTA:
      "Temperatura elevada",

    TEMPERATURA_BAIXA:
      "Temperatura baixa",

    HUMIDADE_ALTA:
      "Humidade elevada",

    HUMIDADE_BAIXA:
      "Humidade baixa",

    DISPOSITIVO_FALHA:
      "Falha de dispositivo"

  };

  return tipos[tipo] || tipo;

}


function formatarData(data) {

  if (!data) {
    return "Data desconhecida";
  }

  const dataFormatada = new Date(data);

  if (isNaN(dataFormatada.getTime())) {
    return data;
  }

  return dataFormatada.toLocaleString("pt-PT");

}

function aplicarFiltros() {

  const estado =
    document.getElementById("filtro-estado").value;

  const tipo =
    document.getElementById("filtro-tipo").value;

  const data =
    document.getElementById("filtro-data").value;


  let alertasFiltrados = todosOsAlertas.filter(alerta => {


    // ─────────────────────────────
    // FILTRO DE ESTADO
    // ─────────────────────────────

    if (estado === "pendentes" && alerta.resolvidoAlerta) {
      return false;
    }

    if (estado === "resolvidos" && !alerta.resolvidoAlerta) {
      return false;
    }


    // ─────────────────────────────
    // FILTRO DE TIPO
    // ─────────────────────────────

    if (
      tipo === "temperatura" &&
      !alerta.tipoAlerta.startsWith("TEMPERATURA")
    ) {
      return false;
    }

    if (
      tipo === "humidade" &&
      !alerta.tipoAlerta.startsWith("HUMIDADE")
    ) {
      return false;
    }


    // ─────────────────────────────
    // FILTRO DE DATA
    // ─────────────────────────────

    if (data !== "todos") {

      const dataAlerta = new Date(alerta.criadoEm);
      const agora = new Date();

      if (data === "hoje") {

        const mesmoDia =
          dataAlerta.getDate() === agora.getDate() &&
          dataAlerta.getMonth() === agora.getMonth() &&
          dataAlerta.getFullYear() === agora.getFullYear();

        if (!mesmoDia) {
          return false;
        }

      }

      if (data === "7dias") {

        const limite = new Date();
        limite.setDate(agora.getDate() - 7);

        if (dataAlerta < limite) {
          return false;
        }

      }

      if (data === "30dias") {

        const limite = new Date();
        limite.setDate(agora.getDate() - 30);

        if (dataAlerta < limite) {
          return false;
        }

      }

    }

    return true;

  });


  renderAlertas(alertasFiltrados);

}

function limparFiltros() {

  document.getElementById("filtro-estado").value = "todos";
  document.getElementById("filtro-tipo").value = "todos";
  document.getElementById("filtro-data").value = "todos";

  aplicarFiltros();

}