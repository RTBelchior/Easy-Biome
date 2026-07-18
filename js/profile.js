/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE PERFIL (profile.html)
   ════════════════════════════════════════════ */

const utilizador = JSON.parse(localStorage.getItem("utilizador"));

document.addEventListener("DOMContentLoaded", () => {

  carregarTerrarios();

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

});

function configurarEmail() {

  const emailInput = document.getElementById("email");

  let emailOriginal = emailInput.value;

  emailInput.addEventListener("focus", () => {
    emailOriginal = emailInput.value;
  });

  emailInput.addEventListener("change", () => {

    if (emailInput.value === emailOriginal)
      return;

    abrirConfirmacao(

      "Guardar alterações",

      "Pretende atualizar o email da sua conta?",

      async () => {

        await atualizarUtilizador({
          emailUtilizador: emailInput.value
        });

        utilizador.emailUtilizador = emailInput.value;
        localStorage.setItem(
          "utilizador",
          JSON.stringify(utilizador)
        );

      },

      () => {

        emailInput.value = emailOriginal;

      }

    );

  });

}

async function carregarTerrarios() {

  const utilizador = JSON.parse(localStorage.getItem("utilizador"));

  const resposta = await fetch(
    `http://localhost:8080/api/terrarios/utilizador/${utilizador.idUtilizador}`
  );

  const terrarios = await resposta.json();

  const grid = document.getElementById("terrarios-grid");

  grid.innerHTML = "";

  terrarios.forEach(t => {


    const imagem = t.imagemTerrario || "imagens/terrario-default.jpg";

    grid.innerHTML += `
    <div class="terrario-card">
        <img src="${imagem}" alt="${t.nomeTerrario}">
        <h4>${t.nomeTerrario}</h4>
    </div>
`;

  });

}


async function atualizarUtilizador(dados) {

  const resposta = await fetch(

    `http://localhost:8080/api/users/${utilizador.idUtilizador}`,

    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    }

  );

  if (!resposta.ok) {
    alert("Não foi possível atualizar o utilizador.");
  }

}

function abrirConfirmacao(titulo, texto, aoConfirmar, aoCancelar) {

  const modal = document.getElementById("confirm-modal");

  document.getElementById("modal-title").textContent = titulo;
  document.getElementById("modal-text").textContent = texto;

  modal.classList.remove("hidden");

  document.getElementById("modal-confirm").onclick = async () => {

    modal.classList.add("hidden");

    if (aoConfirmar) {
      await aoConfirmar();
    }

  };

  document.getElementById("modal-cancel").onclick = () => {

    modal.classList.add("hidden");

    if (aoCancelar) {
      aoCancelar();
    }

  };

}

function configurarPassword() {

  const input = document.getElementById("password");
  const toggle = document.getElementById("toggle-password");

  toggle.addEventListener("click", () => {

    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }

  });

  input.addEventListener("change", () => {

    if (input.value.trim() === "")
      return;

    abrirConfirmacao(
      "Guardar alterações",
      "Pretende alterar a palavra-passe?",
      async () => {

        await atualizarUtilizador({
          password: input.value
        });

        input.value = "";
        input.type = "password";

      },
      () => {

        input.value = "";
        input.type = "password";

      }
    );

  });

}

