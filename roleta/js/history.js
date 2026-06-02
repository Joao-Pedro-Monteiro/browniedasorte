const historyJSON = window.readStorageArray('roulettePlataform.spinHistory');// Lista de histórico de spins

const historyList = document.getElementById('historySection_list'); // Elemento HTML da lista de histórico (<ul>)

let historyListItens = ''; // Itens da lista de histórico (<li>)

//* Ordena a lista do histórico do mais recente para o mais antigo
const sorted = historyJSON.sort((a, b) => {
    return new Date(b.spinTime) - new Date(a.spinTime);
});
console.log('HISTÓRICO ORDENADO')
console.log(sorted);

//* Limpar a lista atual
historyList.innerHTML = '';

//* Iterar sobre o array de histórico e criar os itens da lista
sorted.forEach((e)=>{
    historyListItens += `<li class="historySection_listItem">${e.username} <p class="historySection_listItemPrize">${e.prizeLabel} <span class="historySection_listItemCode">${e.positionCode}</span></p></li>`;
});

historyList.innerHTML = historyListItens;