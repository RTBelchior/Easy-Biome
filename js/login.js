function tpw(id, btn) {
  const el = document.getElementById(id);
  const show = el.type === 'password';
  el.type = show ? 'text' : 'password';
  btn.querySelector('i').className = show ? 'ti ti-eye-off' : 'ti ti-eye';
  btn.setAttribute('aria-label', show ? 'Ocultar' : 'Mostrar');
}

function toast(msg, type) {
  const el = document.getElementById('ebtoast');
  el.innerHTML = `<i class="ti ti-${type === 'ok' ? 'circle-check' : 'alert-circle'}" aria-hidden="true"></i>${msg}`;
  el.className = 'eb-toast on ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 3400);
}

function serr(id, v) {
  const errEl = document.getElementById(id);
  if (!errEl) return;
  errEl.classList.toggle('on', v);
  const wrap = errEl.previousElementSibling;
  if (wrap) {
    const inp = wrap.querySelector('input');
    if (inp) inp.classList.toggle('err', v);
  }
}

function loading(k, on) {
  document.getElementById('bt-' + k).style.display = on ? 'none' : '';
  document.getElementById('sp-' + k).style.display = on ? 'block' : 'none';
  const ic = document.getElementById('ic-' + k);
  if (ic) ic.style.display = on ? 'none' : '';
  document.getElementById('b-' + k).disabled = on;
}

async function doIn() {

    const em = document.getElementById('li-email').value.trim();
    const pw = document.getElementById('li-pw').value;

    const ve = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

    serr('e-li-email', !ve);
    serr('e-li-pw', !pw);

    if (!ve || !pw) return;

    loading('in', true);

    try {

        const resposta = await fetch(`${API_BASE}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: em,
                password: pw
            })
        });

        if (!resposta.ok) {
            throw new Error("Email ou palavra-passe incorretos.");
        }

        const utilizador = await resposta.json();

        localStorage.setItem("utilizador", JSON.stringify(utilizador));

        toast("Sessão iniciada!", "ok");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (e) {

        toast(e.message, "bad");

    } finally {

        loading("in", false);

    }
}