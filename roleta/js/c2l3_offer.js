function check_offer(){
    try {
        // Converte o objeto armazenado no localStrage para array e pega o último item da array
        let history_lastChild = JSON.parse(localStorage.getItem('roulettePlataform.spinHistory')).at(-1);

        console.log('[CHECK_OFFER]:',history_lastChild);
        
        if (history_lastChild.prizeCode != 'C2L3') {
            console.log('[CHECK_OFFER] Não aplicável à oferta');
            return
        }

        // Edita o botão existente
        const oKBtn = document.getElementById('resulPopupBtn-ok');
        oKBtn.setAttribute('onclick', "register_acceptance()");
        oKBtn.innerHTML = 'Aproveitar oferta!';
        oKBtn.style.padding = 'auto'; //Caber o texto maior

        // Adiciona um novo botão para recusar a oferta
        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('popup-btn');
        cancelBtn.innerHTML = 'Deixar para a próxima';
        cancelBtn.setAttribute('id', "resulPopupBtn-deny");
        cancelBtn.setAttribute('onclick', "setTimeout(()=>{window.location.assign('/index.html')}, 500)");
        cancelBtn.style.padding = 'auto';
        oKBtn.insertAdjacentElement('afterend', cancelBtn);
    } catch (error) {
        throw new Error("Process error:", error)
        return
    }
}

async function register_acceptance() {
    try {
        const spinHistory = JSON.parse(localStorage.getItem('roulettePlataform.spinHistory'));
        let history_lastChild = spinHistory.at(-1);

        if (history_lastChild.prizeCode !== 'C2L3') {
            console.log('[REGISTER_ACCEPTANCE] Não aplicável à oferta');
            window.location.assign('../index.html');
            return;
        }

        // Atualiza o histórico local
        history_lastChild.offerAccepted = true;
        history_lastChild.positionCode += '+';
        spinHistory.splice(-1, 1, history_lastChild);
        localStorage.setItem('roulettePlataform.spinHistory', JSON.stringify(spinHistory));

        //! Atualiza o banco de dados
        try {
            const participant = JSON.parse(sessionStorage.getItem('brownie_participant'));
            await db_update('brownieCode', { code: participant.codigo }, { position_code: history_lastChild.positionCode});
        } catch (dbError) {
            throw new Error('[REGISTER_ACCEPTANCE] Erro ao atualizar o banco: ' + dbError.message, { cause: dbError });
        }

        setTimeout(() => { window.location.assign('../index.html'); }, 500);

    } catch (error) {
        console.error('[REGISTER_ACCEPTANCE] Process error:', error);

        setTimeout(() => {
            alert('Ocorreu um erro ao processar sua resposta. Por favor, tente novamente.');
            window.location.assign('../index.html');
        }, 500);
    }
};

