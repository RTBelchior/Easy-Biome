// ==========================================================
// SESSÃO DO UTILIZADOR
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("AUTH.JS carregado");

  const utilizador = getUtilizadorAtual();

  console.log("Utilizador da sessão:", utilizador);

  verificarSessao();

});

function getUtilizadorAtual() {

  const dados = localStorage.getItem("utilizador");

  console.log("Dados da sessão:", dados);

  if (!dados) {
    return null;
  }

  try {

    return JSON.parse(dados);

  } catch (erro) {

    console.error("Sessão inválida:", erro);

    localStorage.removeItem("utilizador");

    return null;
  }
}


function verificarSessao() {

  const utilizador = getUtilizadorAtual();

  console.log(
    "Verificação da sessão:",
    utilizador
  );

  if (!utilizador) {

    sessionStorage.setItem(
      "paginaAnterior",
      window.location.href
    );

    window.location.href = "login.html";

    return false;
  }

  return true;
}


function terminarSessao() {

  localStorage.removeItem("utilizador");

  sessionStorage.removeItem("paginaAnterior");

  window.location.href = "login.html";
}

document.addEventListener(
  "DOMContentLoaded",
  verificarSessao
);