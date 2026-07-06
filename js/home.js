/* ════════════════════════════════════════════
   LÓGICA DA PÁGINA INICIAL (index.html)
   ════════════════════════════════════════════ */

function renderHero() {
  const t = getActive();

  document.getElementById("terrario-img").src = t.img;
  document.getElementById("terrario-name").textContent = t.nome;
}

function renderMetrics() {

  const t = getActive();

  const tw = t.temp > t.tempRange[1] || t.temp < t.tempRange[0];
  const hw = t.hum > t.humRange[1] || t.hum < t.humRange[0];

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
      : `Normal · ${t.tempRange[0]}–${t.tempRange[1]}°C`;

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
      ? (t.hum < t.humRange[0]
        ? "Abaixo do limite"
        : "Acima do limite")
      : `Normal · ${t.humRange[0]}–${t.humRange[1]}%`;
}

function renderDevices() {

  const t = getActive();

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

  const mapa = {
    fan: 1,
    heat: 2,
    light: 3,
    humidifier: 4
  };

  try {

    const resposta = await fetch(
      `http://localhost:8080/api/dispositivos/${mapa[key]}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estadoAtual: estado,
          modoManual: modoManual
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

  const mapa = {
    fan: 1,
    heat: 2,
    light: 3,
    humidifier: 4
  };

  try {

    const resposta = await fetch(
      `http://localhost:8080/api/dispositivos/${mapa[key]}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estadoAtual: getActive()[key],
          modoManual: false
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

function onTerrarioChanged() {

  renderHero();
  renderMetrics();
  renderDevices();

  atualizarDados();

}

async function atualizarDados() {

  try {

    const terrario = getActive();

    // Última leitura

    const resposta = await fetch(
      `http://localhost:8080/api/leituras/ultima/${terrario.id}`
    );

    if (!resposta.ok)
      throw new Error("Erro ao obter leitura");

    const dados = await resposta.json();

    terrario.temp = dados.temperatura;
    terrario.hum = dados.humidade;

    // Dispositivos

    const respostaDispositivos = await fetch(
      `http://localhost:8080/api/dispositivos/terrario/${terrario.id}`
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
          break;

        case "LAMPADA_AQUECIMENTO":
          terrario.heat = d.estadoAtual;
          terrario.heatManual = d.modoManual;
          break;

        case "LAMPADA_ILUMINACAO":
          terrario.light = d.estadoAtual;
          terrario.lightManual = d.modoManual;
          break;

        case "HUMIDIFICADOR":
          terrario.humidifier = d.estadoAtual;
          terrario.humidifierManual = d.modoManual;
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

    saveTerrarios();

    renderHero();
    renderMetrics();
    renderDevices();

  }
  catch (erro) {

    console.error("Erro:", erro);

  }
}

document.addEventListener("DOMContentLoaded", () => {

  renderHero();
  renderMetrics();
  renderDevices();
  renderPickerList();

  atualizarDados();

  setInterval(atualizarDados, 5000);

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