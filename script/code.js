
/* ─── Mock DB ────────────────────────────────────────────────────────────────
    Em produção, substituir por chamadas à sua API/backend.
    validateCode() → GET /api/codes/check?code=XYZ
    submitRegistration() → os dados ficam no estado local; o POST real acontece
    depois do giro da roleta (na página da roleta, junto com o prêmio sorteado).
─────────────────────────────────────────────────────────────────────────── */


let validatedCode = '';
let customerData  = {};

// ── Helpers ────────────────────────────────────────────────────────────────
function msg(id, type, text) {
    const icon = type === 'ok' ? '✓' : '✕';
    document.getElementById(id).innerHTML =
        `<div class="msg ${type}"><span class="msg-icon">${icon}</span><span>${text}</span></div>`;
}

function clearMsg(id) {
    document.getElementById(id).innerHTML = '';
}

function setLoading(btnId, on) {
    const btn = document.getElementById(btnId);
    btn.classList.toggle('loading', on);
    btn.disabled = on;
}

function setInputState(el, state) {
    el.classList.remove('is-error', 'is-ok');
    if (state) el.classList.add(state === 'error' ? 'is-error' : 'is-ok');
}

// ── Input masks ────────────────────────────────────────────────────────────
document.getElementById('codeInput').addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInputState(this, null); clearMsg('codeMsg');
});

document.getElementById('codeInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') validateCode();
});

document.getElementById('inputCPF').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/,      '$1.$2');
    v = v.replace(/(\d{3})(\d)/,      '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
});

document.getElementById('inputTel').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if      (v.length > 6) v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d+)/,            '($1) $2');
    else if (v.length > 0) v = '(' + v;
    this.value = v;
});

// ── STEP 1: Validate code ──────────────────────────────────────────────────
async function validateCode() {
    const inp = document.getElementById('codeInput');
    const usercode = inp.value.trim();

    if (!usercode || usercode.length < 4) {
        setInputState(inp, 'error');
        msg('codeMsg', 'err', 'Por favor, insira um código válido.');
        return;
    }

    setLoading('btnValidate', true);
    clearMsg('codeMsg');
    setInputState(inp, null);

    try {
        const records = await db_read("brownieCode", { code: usercode });

        // Verifica se o código existe no banco
        if (records.length === 0) {
            msg('codeMsg', 'err', 'Código não encontrado.');
            return;
        }

        // Verifica se o código já foi utilizado
        if (records[0].used) {
            msg('codeMsg', 'err', 'Este código já foi utilizado anteriormente.');
            return;
        }

        // Só chega aqui se passou nas duas verificações
        validatedCode = usercode;
        setInputState(inp, 'ok');
        msg('codeMsg', 'ok', 'Código válido! Avançando para o cadastro…');
        setTimeout(goToStep2, 950);

    } catch (err) {
        console.error("Erro ao verificar código:", err);
        setInputState(inp, 'error');
        msg('codeMsg', 'err', 'Erro ao verificar código. Tente novamente mais tarde.');
    } finally {
        setLoading('btnValidate', false);
    }
} 

function goToStep2() {
    document.getElementById('screen1').classList.remove('active');
    document.getElementById('screen2').classList.add('active');
    document.getElementById('codeDisplay').textContent = validatedCode;

    const d1 = document.getElementById('dot1');
    d1.classList.remove('active'); d1.classList.add('done'); d1.textContent = '✓';
    document.getElementById('lbl1').classList.remove('active');
    document.getElementById('line1').classList.add('done');
    document.getElementById('dot2').classList.add('active');
    document.getElementById('lbl2').classList.add('active');
}

// ── STEP 2: Registration ───────────────────────────────────────────────────
function submitRegistration() {
    const nome = document.getElementById('inputNome').value.trim();
    const cpf  = document.getElementById('inputCPF').value.trim();
    const tel  = document.getElementById('inputTel').value.trim();

    if (!nome || nome.split(' ').filter(Boolean).length < 2) {
        msg('regMsg', 'err', 'Informe seu nome completo (nome e sobrenome).');
        document.getElementById('inputNome').focus();
        return;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
        msg('regMsg', 'err', 'CPF inválido. Verifique o número digitado.');
        document.getElementById('inputCPF').focus();
        return;
    }
    if (tel.replace(/\D/g, '').length < 10) {
        msg('regMsg', 'err', 'Telefone inválido. Informe DDD + número.');
        document.getElementById('inputTel').focus();
        return;
    }

    // Armazena localmente — o POST ao banco será feito junto com o prêmio sorteado
    customerData = { nome, cpf, telefone: tel, codigo: validatedCode};

    // Expõe para a próxima página via sessionStorage (disponível em toda a sessão)
    sessionStorage.setItem('brownie_participant', JSON.stringify(customerData));

    setLoading('btnRegister', true);

    setTimeout(goToRoulette, 900);
}

function goToRoulette() {
    document.getElementById('screen2').classList.remove('active');
    document.getElementById('screen3').classList.add('active');

    const d2 = document.getElementById('dot2');
    d2.classList.remove('active'); d2.classList.add('done'); d2.textContent = '✓';
    document.getElementById('lbl2').classList.remove('active');
    document.getElementById('line2').classList.add('done');
    document.getElementById('dot3').classList.add('active');
    document.getElementById('lbl3').classList.add('active');

    // Anima barra de progresso
    requestAnimationFrame(() => {
        setTimeout(() => {
        document.getElementById('progressBar').style.width = '100%';
        }, 100);
    });

    setTimeout(() => { window.location.href = '/roleta'; }, 2200);
}
