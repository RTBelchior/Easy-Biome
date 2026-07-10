/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA DE DEFINIÇÕES (definicoes.html)
   ════════════════════════════════════════════ */

let imagemPredefinida = "terrarioGrande.jpg";
function openShareModal() {
  const nomeAtivo = document.getElementById('set-nome').innerText;
  document.getElementById('share-terrario-nome').innerText = nomeAtivo;
  document.getElementById('share-overlay').classList.add('active');
}

function closeShareModal(event) {
  if (!event || event.target.id === 'share-overlay') {
    document.getElementById('share-overlay').classList.remove('active');
    closeAllDropdowns();
  }
}

/* ── LÓGICA DO CUSTOM DROPDOWN ── */
function toggleDropdownMenu(button) {
  // Impede que o clique feche o modal imediatamente
  event.stopPropagation();
  const menu = button.nextElementSibling;
  const isOpen = menu.classList.contains('show');
  closeAllDropdowns();
  if (!isOpen) {
    menu.classList.add('show');
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

function executeShare() {
  const emailInput = document.getElementById('share-email');
  const roleSelect = document.getElementById('share-role');

  if (!emailInput.value.trim()) {
    alert('Por favor, introduza um e-mail válido.');
    return;
  }

  const selectedRole = roleSelect.value;
  const userList = document.getElementById('share-users-list');
  const item = document.createElement('div');
  item.className = 'share-user-item';

  const isView = selectedRole === 'view';

  item.innerHTML = `
        <div class="share-user-info">
          <span class="share-user-email">${emailInput.value}</span>
          <div class="custom-dropdown-wrapper">
            <button class="custom-dropdown-btn ${isView ? 'role-view' : 'role-admin'}" onclick="toggleDropdownMenu(this)">
              ${isView ? 'Apenas Ver' : 'Administrador'}
            </button>
            <div class="custom-dropdown-menu">
              <div class="custom-dropdown-item" onclick="selectRoleCustom(this, 'view')">Apenas Ver</div>
              <div class="custom-dropdown-item" onclick="selectRoleCustom(this, 'admin')">Administrador</div>
            </div>
          </div>
        </div>
        <button class="share-user-remove" onclick="removeShare(this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      `;

  userList.appendChild(item);
  emailInput.value = '';
}

function removeShare(button) {
  if (confirm('Tem a certeza que deseja revogar o acesso deste utilizador?')) {
    button.parentElement.remove();
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

  if (!idTerrario) return;
  console.log("ID Terrário:", idTerrario);
  const resposta = await fetch(`${API_BASE}/terrarios/${idTerrario}`);
  const terrario = await resposta.json();

  console.log("Terrário:", terrario);
  console.log("ID:", idTerrario);

  document.getElementById("set-nome").textContent =
    terrario.nomeTerrario;

  document.getElementById("set-temp-min").value =
    terrario.tempTerrarioMin;

  document.getElementById("set-temp-max").value =
    terrario.tempTerrarioMax;

  document.getElementById("set-hum-min").value =
    terrario.humidadeTerrarioMin;

  document.getElementById("set-hum-max").value =
    terrario.humidadeTerrarioMax;

  document.getElementById("set-hora-ligar").value =
    terrario.horaLigarIluminacao.substring(0, 5);

  document.getElementById("set-hora-desligar").value =
    terrario.horaDesligarIluminacao.substring(0, 5);
}

[
  "set-temp-min",
  "set-temp-max",
  "set-hum-min",
  "set-hum-max",
  "set-hora-ligar",
  "set-hora-desligar"
].forEach(id => {
  document.getElementById(id).addEventListener("change", guardarDefinicoes);
});


async function guardarDefinicoes() {

  const idTerrario = localStorage.getItem("easybiome_active_id");

  const dados = {

    tempMin: parseFloat(document.getElementById("set-temp-min").value),
    tempMax: parseFloat(document.getElementById("set-temp-max").value),

    humMin: parseInt(document.getElementById("set-hum-min").value),
    humMax: parseInt(document.getElementById("set-hum-max").value),

    horaLigarIluminacao:
      document.getElementById("set-hora-ligar").value,

    horaDesligarIluminacao:
      document.getElementById("set-hora-desligar").value,
  };

  await fetch(`${API_BASE}/terrarios/${idTerrario}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

  console.log("Definições guardadas.");
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

  const tempMin = document.getElementById("temp-min").value;
  const tempMax = document.getElementById("temp-max").value;

  const humMin = document.getElementById("hum-min").value;
  const humMax = document.getElementById("hum-max").value;

  const horaLigar = document.getElementById("hora-ligar").value;
  const horaDesligar = document.getElementById("hora-desligar").value;

  const imagemUpload = document.getElementById("terrario-imagem").files[0];

  if (
    !nome ||
    !tempMin ||
    !tempMax ||
    !humMin ||
    !humMax ||
    !horaLigar ||
    !horaDesligar
  ) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const utilizador = JSON.parse(localStorage.getItem("utilizador"));

  const formData = new FormData();

  formData.append("nome", nome);
  formData.append("descricao", descricao);
  formData.append("tempMin", tempMin);
  formData.append("tempMax", tempMax);
  formData.append("humMin", humMin);
  formData.append("humMax", humMax);
  formData.append("horaLigar", horaLigar);
  formData.append("horaDesligar", horaDesligar);
  formData.append("idUtilizador", utilizador.idUtilizador);

  // Envia upload ou imagem pré-definida
  if (imagemUpload) {

    formData.append("imagem", imagemUpload);

  } else {

    formData.append("imagemPredefinida", imagemPredefinida);

  }

  try {

    const resposta = await fetch(`${API_BASE}/terrarios`, {
      method: "POST",
      body: formData
    });

    if (!resposta.ok) {
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


async function executeShare() {

    const email = document.getElementById("share-email").value;

    const permissao =
        document.getElementById("share-role").value === "admin"
            ? "EDITOR"
            : "LEITOR";

    const idTerrario =
        localStorage.getItem("easybiome_active_id");

    const resposta = await fetch(
        `${API_BASE}/terrarios/${idTerrario}/partilhar`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                permissao
            })
        }
    );

    if (resposta.ok) {
        alert("Terrário partilhado com sucesso.");
    } else {
        alert(await resposta.text());
    }
}