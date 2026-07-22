/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA INICIAL (index.html)
   ════════════════════════════════════════════ */
let imagemPredefinida = "terrarioGrande.jpg";

function renderHero() {

  const t = getActive();

  if (!t) return;

  let imagem = t.imagemTerrario;

  if (imagem) {

    // Se a API devolver "uploads/nome.jpg"
    if (imagem.startsWith("uploads/")) {
      imagem = `${SERVER_BASE}/${imagem.substring("uploads/".length)}`;
    }

    // Se a API devolver apenas "nome.jpg"
    else if (!imagem.startsWith("http")) {
      imagem = `${SERVER_BASE}/${imagem}`;
    }

  } else {

    // Imagem predefinida local
    imagem = "imagens/Terrarios/terrarioPequeno.jpg";

  }

  const img = document.getElementById("terrario-img");

  if (img) {
    img.src = imagem;

    img.onerror = function () {
      console.error("Não foi possível carregar a imagem:", imagem);

      // Fallback local
      this.onerror = null;
      this.src = "imagens/Terrarios/terrarioPequeno.jpg";
    };
  }

  document.getElementById("terrario-name").textContent =
    t.nomeTerrario;
}

function renderMetrics() {

  const t = getActive();

  if (!t) return;
  if (t.temp == null || t.hum == null) return;
  const tw =
    t.temp > t.tempTerrarioMax ||
    t.temp < t.tempTerrarioMin;

  const hw =
    t.hum > t.humidadeTerrarioMax ||
    t.hum < t.humidadeTerrarioMin;

  document.getElementById("temp-val").innerHTML =
    t.temp.toFixed(1) + '<span class="unit">°C</span>';

  document.getElementById("temp-val").className =
    "m-val " + (tw ? "warn" : "ok");

  document.getElementById("temp-card").className =
    "m-card" + (tw ? " warn-border" : "");

  document.getElementById("temp-hint").className =
    "m-hint" + (tw ? " warn" : "");

  document.getElementById("temp-hint").textContent =
    tw
      ? "Fora dos limites!"
      : `Normal · ${t.tempTerrarioMin}–${t.tempTerrarioMax}°C`

  document.getElementById("hum-val").innerHTML =
    Math.round(t.hum) + '<span class="unit">%</span>';

  document.getElementById("hum-val").className =
    "m-val " + (hw ? "warn" : "ok");

  document.getElementById("hum-card").className =
    "m-card" + (hw ? " warn-border" : "");

  document.getElementById("hum-hint").className =
    "m-hint" + (hw ? " warn" : "");

  document.getElementById("hum-hint").textContent =
    hw
      ? (t.hum < t.humidadeTerrarioMin
        ? "Abaixo do limite"
        : "Acima do limite")
      : `Normal · ${t.humidadeTerrarioMin}–${t.humidadeTerrarioMax}%`;
}

function renderDevices() {

  const t = getActive();

  if (!t) return;

  ["fan", "heat", "light", "humidifier"].forEach(key => {

    const on = t[key];

    const toggleEl = document.getElementById(key + "-t");
    const iconEl = document.getElementById(key + "-icon");
    const subEl = document.getElementById(key + "-sub");

    if (toggleEl)
      toggleEl.classList.toggle("on", on);

    if (iconEl)
      iconEl.classList.toggle("on", on);

    if (subEl) {

      const labels = {
        fan: on ? "A ventilar" : "Desligada",
        heat: on ? "Ligada · Relé OK" : "Desligada",
        light: on ? "Ligada" : "Desligada",
        humidifier: on ? "A humidificar" : "Desligado"
      };

      subEl.textContent = labels[key];
    }
  });
}

async function toggleDev(key) {

  const terrario = getActive();
  const novoEstado = !terrario[key];

  const modoManual = terrario[key + "Manual"];

  // Só mostra o aviso se ainda estiver em automático
  if (novoEstado && !modoManual) {
    abrirModalManual(key);
    return;
  }

  // Se já está em modo manual, altera diretamente
  await ligarDispositivo(key, novoEstado, true);
}

async function ligarDispositivo(key, estado, modoManual = true) {
  const terrario = getActive();
  const utilizador = JSON.parse(localStorage.getItem("utilizador"));
  console.log(utilizador);

  const mapa = {
    fan: terrario.fanId,
    heat: terrario.heatId,
    light: terrario.lightId,
    humidifier: terrario.humidifierId
  };

  try {

    const resposta = await fetch(`${API_BASE}/dispositivos/${mapa[key]}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estadoAtual: estado,
        modoManual: modoManual,
        idUtilizador: utilizador.idUtilizador
      })
    }
    );

    if (!resposta.ok) {
      throw new Error("Erro ao atualizar dispositivo");
    }

    await atualizarDados();

  } catch (erro) {
    console.error(erro);
  }
}

async function voltarModoAutomatico(key) {

  const terrario = getActive();
  const utilizador = JSON.parse(localStorage.getItem("utilizador"));
  console.log(utilizador);

  const mapa = {
    fan: terrario.fanId,
    heat: terrario.heatId,
    light: terrario.lightId,
    humidifier: terrario.humidifierId
  };

  try {

    const resposta = await fetch(
      `${API_BASE}/dispositivos/${mapa[key]}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estadoAtual: getActive()[key],
          modoManual: false,
          idUtilizador: utilizador.idUtilizador
        })
      }
    );

    if (!resposta.ok)
      throw new Error("Erro");

    await atualizarDados();

  } catch (e) {
    console.error(e);
  }
}

async function onTerrarioChanged() {

  await atualizarDados();

  renderHero();
  renderMetrics();
  renderDevices();
}

async function atualizarDados() {

  console.log("A atualizar dados...");

  try {

    const terrario = getActive();
    if (!terrario) return;

    // Última leitura

    const resposta = await fetch(
      `${API_BASE}/leituras/ultima/${terrario.idTerrario}`
    );

    if (!resposta.ok)
      throw new Error("Erro ao obter leitura");

    const dados = await resposta.json();
    console.log(dados);

    terrario.temp = dados.temperatura;
    terrario.hum = dados.humidade;

    // Dispositivos

    const respostaDispositivos = await fetch(
      `${API_BASE}/dispositivos/terrario/${terrario.idTerrario}`
    );

    if (!respostaDispositivos.ok)
      throw new Error("Erro ao obter dispositivos");

    const dispositivos = await respostaDispositivos.json();

    let existeModoManual = false;

    dispositivos.forEach(d => {

      switch (d.tipoDispositivo) {

        case "VENTOINHA":
          terrario.fan = d.estadoAtual;
          terrario.fanManual = d.modoManual;
          terrario.fanId = d.idDispositivo;
          break;

        case "LAMPADA_AQUECIMENTO":
          terrario.heat = d.estadoAtual;
          terrario.heatManual = d.modoManual;
          terrario.heatId = d.idDispositivo;
          break;

        case "LAMPADA_ILUMINACAO":
          terrario.light = d.estadoAtual;
          terrario.lightManual = d.modoManual;
          terrario.lightId = d.idDispositivo;
          break;

        case "HUMIDIFICADOR":
          terrario.humidifier = d.estadoAtual;
          terrario.humidifierManual = d.modoManual;
          terrario.humidifierId = d.idDispositivo;
          break;
      }

      const mapa = {
        "VENTOINHA": "fan",
        "LAMPADA_AQUECIMENTO": "heat",
        "LAMPADA_ILUMINACAO": "light",
        "HUMIDIFICADOR": "humidifier"
      };

      const key = mapa[d.tipoDispositivo];

      const tag = document.getElementById(key + "-manual");

      if (tag) {
        tag.style.display =
          d.modoManual ? "inline-block" : "none";
      }

      const autoBtn = document.getElementById(key + "-auto");

      if (autoBtn) {
        autoBtn.style.display =
          d.modoManual ? "inline-flex" : "none";
      }

      if (d.modoManual) {
        existeModoManual = true;
      }

    });

    const banner = document.getElementById("manual-banner");

    if (banner) {
      banner.style.display =
        existeModoManual ? "block" : "none";
    }

    renderHero();
    renderMetrics();
    renderDevices();

  }
  catch (erro) {

    console.error("Erro:", erro);

  }
}

document.addEventListener("DOMContentLoaded", async () => {

  console.log("Página carregada");

  renderPickerList();


  // ==========================================================
  // SELEÇÃO DE IMAGEM PERSONALIZADA
  // ==========================================================

  const inputImagem = document.getElementById("terrario-imagem");
  const imagemSelecionada = document.getElementById("imagem-selecionada");

  if (inputImagem) {

    inputImagem.addEventListener("change", function () {

      const ficheiro = this.files[0];

      if (ficheiro) {

        // Mostra o nome da imagem escolhida
        imagemSelecionada.textContent =
          "📷 " + ficheiro.name;

        imagemSelecionada.classList.add("selected");

        // Remove a seleção das imagens predefinidas
        document.querySelectorAll(".terrario-option")
          .forEach(o => o.classList.remove("selected"));

        // Não usar imagem predefinida
        imagemPredefinida = null;

        console.log("Imagem personalizada selecionada:", ficheiro.name);

      } else {

        imagemSelecionada.textContent =
          "Nenhuma imagem selecionada";

        imagemSelecionada.classList.remove("selected");

      }

    });

  }


  // ==========================================================
  // SELEÇÃO DE IMAGEM PREDEFINIDA
  // ==========================================================

  document.querySelectorAll(".terrario-option").forEach(opcao => {

    opcao.addEventListener("click", function () {

      // Remove seleção das outras imagens
      document.querySelectorAll(".terrario-option")
        .forEach(o => o.classList.remove("selected"));

      // Seleciona esta imagem
      this.classList.add("selected");

      // Guarda a imagem predefinida
      imagemPredefinida = this.dataset.img;

      // Remove eventual ficheiro personalizado
      if (inputImagem) {
        inputImagem.value = "";
      }

      // Atualiza o texto
      if (imagemSelecionada) {

        imagemSelecionada.textContent =
          "Imagem predefinida: " + imagemPredefinida;

        imagemSelecionada.classList.remove("selected");

      }

      console.log(
        "Imagem predefinida selecionada:",
        imagemPredefinida
      );

    });

  });

});

let dispositivoPendente = null;

function abrirModalManual(key) {
  dispositivoPendente = key;
  document.getElementById("manual-modal").style.display = "flex";
}

function fecharModalManual() {
  document.getElementById("manual-modal").style.display = "none";
}

async function confirmarModoManual() {

  fecharModalManual();

  const terrario = getActive();
  terrario[dispositivoPendente + "Manual"] = true;

  await ligarDispositivo(dispositivoPendente, true, true);

  dispositivoPendente = null;
}

function abrirModalTerrario() {

  closeTerrarioPicker();

  document.getElementById("modal-terrario").style.display = "flex";

  imagemPredefinida = "terrarioGrande.jpg";

  document.querySelectorAll(".terrario-option")
    .forEach(el => el.classList.remove("selected"));

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

    // O utilizador escolheu uma imagem própria
    console.log("A enviar imagem personalizada:", imagemUpload.name);

    formData.append("imagem", imagemUpload);

  } else if (imagemPredefinida) {

    // O utilizador escolheu uma imagem predefinida
    console.log("A enviar imagem predefinida:", imagemPredefinida);

    formData.append("imagemPredefinida", imagemPredefinida);

  } else {

    console.log("Nenhuma imagem selecionada");

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