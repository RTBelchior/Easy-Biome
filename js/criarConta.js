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

function chkStr(pw) {
  const segs = ['s1', 's2', 's3', 's4'].map(id => document.getElementById(id));
  const lbl = document.getElementById('slbl');
  let sc = 0;
  if (pw.length >= 8) sc++;
  if (/[A-Z]/.test(pw)) sc++;
  if (/[0-9]/.test(pw)) sc++;
  if (/[^A-Za-z0-9]/.test(pw)) sc++;
  const c = ['#E24B4A', '#EF9F27', '#97C459', '#3B6D11'];
  const l = ['Fraca', 'Razoável', 'Boa', 'Forte'];
  segs.forEach((s, i) => s.style.background = i < sc ? c[sc - 1] : 'var(--color-border-tertiary)');
  lbl.textContent = pw.length ? l[Math.max(0, sc - 1)] : '';
  lbl.style.color = pw.length ? c[Math.max(0, sc - 1)] : 'var(--color-text-tertiary)';
}

function loading(k, on) {
  document.getElementById('bt-' + k).style.display = on ? 'none' : '';
  document.getElementById('sp-' + k).style.display = on ? 'block' : 'none';
  const ic = document.getElementById('ic-' + k);
  if (ic) ic.style.display = on ? 'none' : '';
  document.getElementById('b-' + k).disabled = on;
}

async function doUp() {

    const fn = document.getElementById('rg-fn').value.trim();
    const em = document.getElementById('rg-em').value.trim();
    const pw = document.getElementById('rg-pw').value;
    const p2 = document.getElementById('rg-p2').value;

    const ve = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

    serr('e-rg-fn', !fn);
    serr('e-rg-em', !ve);
    serr('e-rg-pw', pw.length < 8);
    serr('e-rg-p2', pw !== p2);

    if (!fn || !ve || pw.length < 8 || pw !== p2)
        return;

    loading("up", true);

    try {

        const resposta = await fetch(`${API_BASE}/users/registar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: fn,
                email: em,
                password: pw
            })
        });

        if (!resposta.ok)
            throw new Error("Erro ao criar conta.");

        toast("Conta criada com sucesso!", "ok");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (e) {

        toast(e.message, "bad");

    } finally {

        loading("up", false);

    }
}