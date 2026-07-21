/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE PERFIL
   ════════════════════════════════════════════ */

const utilizador = JSON.parse(localStorage.getItem("utilizador"));


document.addEventListener("DOMContentLoaded", () => {

  carregarTerrarios();

  calcularDiasUtilizacao();

  document.getElementById("email").value =
    utilizador.emailUtilizador;

  document.getElementById("profile-name").textContent =
    utilizador.nomeUtilizador;

  document.getElementById("profile-email").textContent =
    utilizador.emailUtilizador;

  document.getElementById("settings-name").textContent =
    utilizador.nomeUtilizador;

  configurarEmail();
  configurarPassword();
  configurarTogglePassword();

});


/* ════════════════════════════════════════════
   CARREGAR PERFIL
   ════════════════════════════════════════════ */

async function carregarPerfil() {

  document.getElementById("email").value =
    utilizador.emailUtilizador;

  document.getElementById("profile-name").textContent =
    utilizador.nomeUtilizador;

  document.getElementById("profile-email").textContent =
    utilizador.emailUtilizador;

  document.getElementById("settings-name").textContent =
    utilizador.nomeUtilizador;


  await carregarTerrarios();

}


/* ════════════════════════════════════════════
   CARREGAR TERRÁRIOS + ESTATÍSTICAS
   ════════════════════════════════════════════ */

async function carregarTerrarios() {

  try {

    const resposta = await fetch(
      `${API_BASE}/terrarios/utilizador/${utilizador.idUtilizador}`
    );

    if (!resposta.ok) {
      throw new Error("Erro ao carregar terrários.");
    }

    const terrarios = await resposta.json();


    /* ─────────────────────────
       NÚMERO DE TERRÁRIOS
    ───────────────────────── */

    document.getElementById("stat-terrarios").textContent =
      terrarios.length;


    /* ─────────────────────────
       CALCULAR DIAS DE UTILIZAÇÃO
    ───────────────────────── */

    calcularDiasUtilizacao(terrarios);


    /* ─────────────────────────
       MOSTRAR TERRÁRIOS
    ───────────────────────── */

    mostrarTerrarios(terrarios);


    /* ─────────────────────────
       LEITURAS E ALERTAS
    ───────────────────────── */

    let totalLeituras = 0;

    let totalAlertas = 0;


    for (const terrario of terrarios) {

      try {

        const respostaLeituras = await fetch(
          `${API_BASE}/leituras/historico/${terrario.idTerrario}?horas=24`
        );

        if (respostaLeituras.ok) {

          const leituras =
            await respostaLeituras.json();

          totalLeituras += leituras.length;

        }

      } catch (erro) {

        console.error(
          "Erro ao carregar leituras:",
          erro
        );

      }


      try {

        const respostaAlertas = await fetch(
          `${API_BASE}/alertas/terrario/${terrario.idTerrario}`
        );

        if (respostaAlertas.ok) {

          const alertas =
            await respostaAlertas.json();

          const hoje = new Date();

          totalAlertas += alertas.filter(alerta => {

            if (!alerta.criadoEm) {
              return false;
            }

            const dataAlerta =
              new Date(alerta.criadoEm);

            return (
              dataAlerta.getDate() === hoje.getDate() &&
              dataAlerta.getMonth() === hoje.getMonth() &&
              dataAlerta.getFullYear() === hoje.getFullYear()
            );

          }).length;

        }

      } catch (erro) {

        console.error(
          "Erro ao carregar alertas:",
          erro
        );

      }

    }


    document.getElementById("stat-leituras").textContent =
      totalLeituras;

    document.getElementById("stat-alerta").textContent =
      totalAlertas;


  } catch (erro) {

    console.error(
      "Erro ao carregar dados do perfil:",
      erro
    );

  }

}


/* ════════════════════════════════════════════
   MOSTRAR TERRÁRIOS
   ════════════════════════════════════════════ */

function mostrarTerrarios(terrarios) {

  const grid =
    document.getElementById("terrarios-grid");

  if (!grid) return;

  grid.innerHTML = "";


  if (terrarios.length === 0) {

    grid.innerHTML = `
      <div class="empty-state">
        Ainda não tem terrários registados.
      </div>
    `;

    return;

  }


  terrarios.forEach(t => {

    let imagem;


    if (!t.imagemTerrario) {

      imagem =
        "imagens/terrario-default.jpg";

    } else if (
      t.imagemTerrario.startsWith("uploads/")
    ) {

      imagem =
        `${SERVER_BASE}/${t.imagemTerrario.replace("uploads/", "")}`;

    } else {

      imagem =
        t.imagemTerrario;

    }


    grid.innerHTML += `

      <div class="terrario-card">

        <img
          src="${imagem}"
          alt="${t.nomeTerrario}"
          onerror="this.src='imagens/terrario-default.jpg'"
        >

        <h4>
          ${t.nomeTerrario}
        </h4>

      </div>

    `;

  });

}


/* ════════════════════════════════════════════
   DIAS DE UTILIZAÇÃO
   ════════════════════════════════════════════ */

function calcularDiasUtilizacao() {

  const criadoEm = new Date(utilizador.criadoEm);

  if (isNaN(criadoEm.getTime())) {
    document.getElementById("stat-dias").textContent = "0";
    return;
  }

  const agora = new Date();

  const diferenca =
    agora.getTime() - criadoEm.getTime();

  const dias =
    Math.floor(diferenca / (1000 * 60 * 60 * 24));

  document.getElementById("stat-dias").textContent =
    dias;
}

/* ════════════════════════════════════════════
   EMAIL
   ════════════════════════════════════════════ */

function configurarEmail() {

  const emailInput =
    document.getElementById("email");

  let emailOriginal =
    emailInput.value;


  emailInput.addEventListener(
    "focus",
    () => {

      emailOriginal =
        emailInput.value;

    }
  );


  emailInput.addEventListener(
    "change",
    () => {

      if (
        emailInput.value ===
        emailOriginal
      ) {
        return;
      }


      abrirConfirmacao(

        "Guardar alterações",

        "Pretende atualizar o email da sua conta?",

        async () => {

          await atualizarUtilizador({

            emailUtilizador:
              emailInput.value

          });


          utilizador.emailUtilizador =
            emailInput.value;


          localStorage.setItem(
            "utilizador",
            JSON.stringify(utilizador)
          );


          document.getElementById(
            "profile-email"
          ).textContent =
            emailInput.value;

        },


        () => {

          emailInput.value =
            emailOriginal;

        }

      );

    }

  );

}


/* ════════════════════════════════════════════
   PASSWORD
   ════════════════════════════════════════════ */

function configurarPassword() {

  const input =
    document.getElementById("password");

  const botaoGuardar =
    document.getElementById("guardar-password");


  botaoGuardar.addEventListener(
    "click",
    async () => {

      const novaPassword =
        input.value.trim();


      // Verificar se foi preenchida
      if (novaPassword === "") {

        alert(
          "Introduza uma nova palavra-passe."
        );

        input.focus();

        return;

      }


      // Verificar tamanho mínimo
      if (novaPassword.length < 6) {

        alert(
          "A palavra-passe deve ter pelo menos 6 caracteres."
        );

        input.focus();

        return;

      }


      abrirConfirmacao(

        "Alterar palavra-passe",

        "Tem a certeza de que pretende alterar a palavra-passe?",


        async () => {

          try {

            botaoGuardar.disabled = true;

            botaoGuardar.textContent =
              "A guardar...";


            await atualizarUtilizador({

              password:
                novaPassword

            });


            // Limpar campo
            input.value = "";

            input.type =
              "password";


            alert(
              "Palavra-passe alterada com sucesso."
            );


          } catch (erro) {

            console.error(
              "Erro ao alterar password:",
              erro
            );

          } finally {

            botaoGuardar.disabled = false;

            botaoGuardar.textContent =
              "Guardar alterações";

          }

        },


        () => {

          input.value = "";

          input.type =
            "password";

        }

      );

    }

  );

}


/* ════════════════════════════════════════════
   MOSTRAR / ESCONDER PASSWORD
   ════════════════════════════════════════════ */

function configurarTogglePassword() {

  const input =
    document.getElementById("password");

  const toggle =
    document.getElementById("toggle-password");


  toggle.addEventListener(
    "click",
    () => {

      if (input.type === "password") {

        input.type = "text";

        toggle.title =
          "Esconder password";

      } else {

        input.type = "password";

        toggle.title =
          "Mostrar password";

      }

    }
  );

}


/* ════════════════════════════════════════════
   ATUALIZAR UTILIZADOR
   ════════════════════════════════════════════ */

async function atualizarUtilizador(dados) {

  const resposta =
    await fetch(

      `${API_BASE}/users/${utilizador.idUtilizador}`,

      {

        method: "PUT",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify(dados)

      }

    );


  if (!resposta.ok) {

    alert(
      "Não foi possível atualizar o utilizador."
    );

    throw new Error(
      "Erro ao atualizar utilizador."
    );

  }

}


/* ════════════════════════════════════════════
   MODAL DE CONFIRMAÇÃO
   ════════════════════════════════════════════ */

function abrirConfirmacao(
  titulo,
  texto,
  aoConfirmar,
  aoCancelar
) {

  const modal =
    document.getElementById(
      "confirm-modal"
    );


  document.getElementById(
    "modal-title"
  ).textContent =
    titulo;


  document.getElementById(
    "modal-text"
  ).textContent =
    texto;


  modal.classList.remove(
    "hidden"
  );


  document.getElementById(
    "modal-confirm"
  ).onclick =
    async () => {

      modal.classList.add(
        "hidden"
      );


      if (aoConfirmar) {

        await aoConfirmar();

      }

    };


  document.getElementById(
    "modal-cancel"
  ).onclick =
    () => {

      modal.classList.add(
        "hidden"
      );


      if (aoCancelar) {

        aoCancelar();

      }

    };

}