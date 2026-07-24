/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE DEFINIÇÕES (definicoes.html)
   ════════════════════════════════════════════ */

let imagemPredefinida = "terrarioGrande.jpg";
let terrarioSelecionado = null;

async function openShareModal() {

  const idTerrario =
    localStorage.getItem(
      "easybiome_active_id"
    );


  if (!idTerrario) {

    alert(
      "Nenhum terrário está selecionado."
    );

    return;

  }


  const modal =
    document.getElementById(
      "share-overlay"
    );


  if (modal) {

    modal.style.display = "flex";

  }


  const nomeTerrario =
    document.getElementById(
      "set-nome"
    )?.textContent;


  const nomeElemento =
    document.getElementById(
      "share-terrario-nome"
    );


  if (nomeElemento) {

    nomeElemento.textContent =
      nomeTerrario ||
      "Terrário selecionado";

  }


  await carregarUtilizadoresComAcesso();

}

function closeShareModal(event) {

  // Só fecha se clicar diretamente no fundo do modal
  if (!event || event.target.id === "share-overlay") {

    const modal =
      document.getElementById("share-overlay");

    if (modal) {

      modal.style.display = "none";
      modal.classList.remove("active");

    }

    closeAllDropdowns();
  }
}

/* ── LÓGICA DO CUSTOM DROPDOWN ── */
function toggleDropdownMenu(event, button) {

  event.stopPropagation();

  const menu = button.nextElementSibling;

  const isOpen =
    menu.classList.contains("show");

  closeAllDropdowns();

  if (!isOpen) {
    menu.classList.add("show");
  }

}

function selectRoleCustom(itemElement, roleCode) {
  const wrapper = itemElement.closest('.custom-dropdown-wrapper');
  const button = wrapper.querySelector('.custom-dropdown-btn');
  const email = itemElement.closest('.share-user-item').querySelector('.share-user-email').innerText;

  if (roleCode === 'view') {
    button.innerText = 'Apenas Ver';
    button.className = 'custom-dropdown-btn role-view';
  } else {
    button.innerText = 'Administrador';
    button.className = 'custom-dropdown-btn role-admin';
  }

  console.log(`Permissão de ${email} alterada para: ${roleCode}`);
  closeAllDropdowns();
}

function closeAllDropdowns() {
  document.querySelectorAll('.custom-dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
}

// Fecha os menus se o utilizador clicar algures fora deles
document.addEventListener('click', closeAllDropdowns);

async function executeShare() {

  const emailInput =
    document.getElementById("share-email");

  const email =
    emailInput.value.trim();

  const idTerrario =
    localStorage.getItem("easybiome_active_id");


  // ============================================================
  // 1. Verificar se existe um terrário selecionado
  // ============================================================

  if (!idTerrario) {

    alert(
      "Não foi possível identificar o terrário selecionado."
    );

    return;
  }


  // ============================================================
  // 2. Verificar se foi introduzido um email
  // ============================================================

  if (!email) {

    alert(
      "Introduza o e-mail do utilizador."
    );

    emailInput.focus();

    return;
  }


  // ============================================================
  // 3. Validar formato básico do email
  // ============================================================

  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValido) {

    alert(
      "Introduza um endereço de e-mail válido."
    );

    emailInput.focus();

    return;
  }


  try {

    // ============================================================
    // 4. Enviar pedido para o backend
    // ============================================================

    const resposta =
      await fetch(
        `${API_BASE}/terrarios/${idTerrario}/partilhar`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              email: email
            })
        }
      );


    // ============================================================
    // 5. Se o backend rejeitar o pedido
    // ============================================================

    if (!resposta.ok) {

      const erro =
        await resposta.text();

      alert(
        erro ||
        "Não foi possível partilhar o terrário."
      );

      return;
    }


    // ============================================================
    // 6. Partilha realizada com sucesso
    // ============================================================

    alert(
      "Terrário partilhado com sucesso."
    );


    // Limpar campo de email
    emailInput.value = "";


    // Atualizar lista de utilizadores
    await carregarUtilizadoresComAcesso();


  } catch (erro) {

    console.error(
      "Erro ao partilhar terrário:",
      erro
    );

    alert(
      "Erro de comunicação com a API."
    );

  }

}

async function removerUtilizadorTerrario(idUtilizador) {

  const idTerrario =
    localStorage.getItem("easybiome_active_id");

  if (!idTerrario) {
    alert("Não foi possível identificar o terrário.");
    return;
  }

  if (
    !confirm(
      "Tem a certeza que deseja remover este utilizador do terrário?"
    )
  ) {
    return;
  }

  try {

    const resposta = await fetch(
      `${API_BASE}/terrarios/${idTerrario}/utilizadores/${idUtilizador}`,
      {
        method: "DELETE"
      }
    );

    if (!resposta.ok) {

      const erro = await resposta.text();

      alert(
        erro ||
        "Não foi possível remover o utilizador."
      );

      return;
    }

    alert(
      "Utilizador removido do terrário com sucesso."
    );

    await carregarUtilizadoresComAcesso();

  } catch (erro) {

    console.error(
      "Erro ao remover utilizador:",
      erro
    );

    alert(
      "Erro de comunicação com a API."
    );
  }
}

async function onTerrarioChanged() {
  await carregarDefinicoes();
  renderPickerList();
  closeTerrarioPicker();
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Página carregada");

  renderPickerList();
  await carregarDefinicoes();

  const utilizador = JSON.parse(localStorage.getItem("utilizador"));

  if (utilizador) {
    document.getElementById("profile-name").textContent =
      utilizador.nomeUtilizador;

    document.getElementById("profile-email").textContent =
      utilizador.emailUtilizador;
  }
});

async function carregarDefinicoes() {
  console.log("carregarDefinicoes foi chamada");

  const idTerrario = localStorage.getItem("easybiome_active_id");

  if (!idTerrario) {
    console.error("Nenhum terrário ativo.");
    return;
  }

  console.log("ID Terrário:", idTerrario);

  try {
    const resposta = await fetch(`${API_BASE}/terrarios/${idTerrario}`);

    if (!resposta.ok) {
      console.error("Erro ao carregar terrário:", await resposta.text());
      return;
    }

    const terrario = await resposta.json();

    console.log("Terrário:", terrario);

    // Nome apresentado no campo "Terrário Selecionado"
    document.getElementById("set-nome").textContent =
      terrario.nomeTerrario || "Sem nome";

    // Nome no campo de edição
    document.getElementById("set-nome-input").value =
      terrario.nomeTerrario || "";

    // Descrição no campo de edição
    document.getElementById("set-descricao-input").value =
      terrario.descricaoTerrario || "";

    // Temperatura
    document.getElementById("set-temp-min").value =
      terrario.tempTerrarioMin ?? "";

    document.getElementById("set-temp-max").value =
      terrario.tempTerrarioMax ?? "";

    // Humidade
    document.getElementById("set-hum-min").value =
      terrario.humidadeTerrarioMin ?? "";

    document.getElementById("set-hum-max").value =
      terrario.humidadeTerrarioMax ?? "";

    // Iluminação
    document.getElementById("set-hora-ligar").value =
      terrario.horaLigarIluminacao
        ? terrario.horaLigarIluminacao.substring(0, 5)
        : "";

    document.getElementById("set-hora-desligar").value =
      terrario.horaDesligarIluminacao
        ? terrario.horaDesligarIluminacao.substring(0, 5)
        : "";

  } catch (erro) {
    console.error("Erro ao carregar definições:", erro);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  [
    "set-nome-input",
    "set-descricao-input",
    "set-temp-min",
    "set-temp-max",
    "set-hum-min",
    "set-hum-max",
    "set-hora-ligar",
    "set-hora-desligar"
  ].forEach(id => {

    const input = document.getElementById(id);

    if (input) {
      input.addEventListener("change", guardarDefinicoes);
    }

  });

});


async function guardarDefinicoes() {

  const idTerrario = localStorage.getItem("easybiome_active_id");

  if (!idTerrario) {
    console.error("Nenhum terrário ativo.");
    return;
  }

  const dados = {

    // O DTO Java espera "nome"
    nome:
      document.getElementById("set-nome-input").value.trim(),

    // O DTO Java espera "descricao"
    descricao:
      document.getElementById("set-descricao-input").value.trim(),

    // Temperatura
    tempMin:
      parseFloat(document.getElementById("set-temp-min").value),

    tempMax:
      parseFloat(document.getElementById("set-temp-max").value),

    // Humidade
    humMin:
      parseFloat(document.getElementById("set-hum-min").value),

    humMax:
      parseFloat(document.getElementById("set-hum-max").value),

    // Iluminação
    horaLigar:
      document.getElementById("set-hora-ligar").value,

    horaDesligar:
      document.getElementById("set-hora-desligar").value
  };

  console.log("Dados a guardar:", dados);

  try {

    const resposta = await fetch(
      `${API_BASE}/terrarios/${idTerrario}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      }
    );

    if (!resposta.ok) {
      console.error("Erro ao guardar:", await resposta.text());
      return;
    }

    // Atualiza o nome apresentado no topo
    document.getElementById("set-nome").textContent =
      dados.nome || "Sem nome";

    console.log("Definições guardadas com sucesso.");

  } catch (erro) {

    console.error("Erro ao guardar definições:", erro);

  }
}



fetch("header.html")
  .then(r => r.text())
  .then(data => {
    document.getElementById("header-container").innerHTML = data;

    const pagina = window.location.pathname.split("/").pop() || "index.html";

    const titulos = {
      "index.html": "Início",
      "historico.html": "Histórico",
      "atividade.html": "Atividade",
      "alertas.html": "Alertas",
      "definicoes.html": "Definições",
      "profile.html": "Perfil"
    };

    const titulo = document.getElementById("page-title");
    if (titulo) {
      titulo.textContent = titulos[pagina] || "EasyBiome";
    }

    document.querySelectorAll(".desktop-nav-link").forEach(link => {
      if (link.getAttribute("href") === pagina) {
        link.classList.add("active");
      }
    });

    document.querySelectorAll(".bnav-item").forEach(link => {
      if (link.getAttribute("href") === pagina) {
        link.classList.add("active");
      }
    });
  });

document.querySelectorAll(".terrario-option").forEach(opcao => {

  opcao.addEventListener("click", function () {

    document.querySelectorAll(".terrario-option")
      .forEach(o => o.classList.remove("selected"));

    this.classList.add("selected");

    imagemPredefinida = this.dataset.img;
  });

});

function abrirModalTerrario() {

  document.getElementById("modal-terrario").style.display = "flex";

  imagemPredefinida = "terrarioGrande.jpg";

  document.querySelectorAll(".terrario-option").forEach(el => {
    el.classList.remove("selected");
  });

  document.querySelector(".terrario-option")?.classList.add("selected");
}

async function guardarTerrario() {

  const nome = document.getElementById("terrario-nome").value.trim();
  const descricao = document.getElementById("terrario-descricao").value.trim();

  if (!nome) {
    alert("Por favor, introduza o nome do terrário.");
    return;
  }

  const utilizador = JSON.parse(localStorage.getItem("utilizador"));

  if (!utilizador) {
    alert("Utilizador não encontrado.");
    return;
  }

  const dados = {
    nomeTerrario: nome,
    descricaoTerrario: descricao,
    idUtilizador: utilizador.idUtilizador
  };

  console.log("Dados a enviar:", dados);

  try {

    const resposta = await fetch(`${API_BASE}/terrarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error("Erro do backend:", erro);
      throw new Error("Erro ao criar terrário.");
    }

    fecharModalTerrario();

    await carregarTerrarios();

    alert("Terrário criado com sucesso!");

  } catch (erro) {

    console.error(erro);
    alert("Não foi possível criar o terrário.");

  }
}

function fecharModalTerrario() {

  document.getElementById("modal-terrario").style.display = "none";

  document.getElementById("terrario-nome").value = "";
  document.getElementById("terrario-descricao").value = "";
  document.getElementById("temp-min").value = "";
  document.getElementById("temp-max").value = "";
  document.getElementById("hum-min").value = "";
  document.getElementById("hum-max").value = "";
  document.getElementById("hora-ligar").value = "";
  document.getElementById("hora-desligar").value = "";
  document.getElementById("terrario-imagem").value = "";

  document.querySelectorAll(".terrario-option").forEach(el => {
    el.classList.remove("selected");
  });

  document.querySelector(".terrario-option")?.classList.add("selected");
  imagemPredefinida = "terrarioGrande.jpg";
}

async function carregarUtilizadoresComAcesso() {

  const idTerrario =
    localStorage.getItem("easybiome_active_id");

  if (!idTerrario) {
    console.log("Nenhum terrário selecionado.");
    return;
  }

  try {

    const response = await fetch(
      `${API_BASE}/terrarios/${idTerrario}/utilizadores`
    );

    if (!response.ok) {

      const erro = await response.text();

      throw new Error(
        erro ||
        "Erro ao obter utilizadores do terrário."
      );
    }

    const relacoes =
      await response.json();

    mostrarUtilizadoresTerrario(
      relacoes
    );

  } catch (error) {

    console.error(
      "Erro ao carregar utilizadores:",
      error
    );

  }
}

function mostrarUtilizadoresTerrario(relacoes) {

  const lista =
    document.getElementById("share-users-list");

  if (!lista) {
    console.error(
      "Elemento #share-users-list não encontrado."
    );
    return;
  }

  lista.innerHTML = "";

  if (!relacoes || relacoes.length === 0) {

    lista.innerHTML = `
            <div style="
                padding: 15px;
                text-align: center;
                color: var(--text3);
                font-size: 13px;
            ">
                Ainda não existem utilizadores com acesso a este terrário.
            </div>
        `;

    return;
  }

  relacoes.forEach(relacao => {

    const utilizador =
      relacao.utilizador;

    const permissao =
      relacao.permissaoTerrario;

    const div =
      document.createElement("div");

    div.className =
      "share-user-item";

    let botaoRemover = "";

    if (permissao === "PARTILHADO") {

      botaoRemover = `
                <button
                    class="share-user-remove"
                    onclick="removerUtilizadorTerrario(
                        ${utilizador.idUtilizador}
                    )"
                    title="Remover utilizador"
                >
                    Remover
                </button>
            `;
    }

    div.innerHTML = `

            <div class="share-user-info">

                <strong>
                    ${utilizador.nomeUtilizador}
                </strong>

                <span class="share-user-email">
                    ${utilizador.emailUtilizador}
                </span>

                <span style="
                    font-size: 11px;
                    color: var(--text3);
                ">
                    ${permissao}
                </span>

            </div>

            ${botaoRemover}

        `;

    lista.appendChild(div);

  });

}

