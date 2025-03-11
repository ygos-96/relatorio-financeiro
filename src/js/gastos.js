const API_URL =
  'https://script.google.com/macros/s/AKfycbyFt1lMr0TeV7ap758y4nguCH5fALGK0uMha0T3LZPDs7cmBzV2diVha4OuJMjSWl1n/exec'; // Substitua pela nova URL do Google Apps Script

document
  .getElementById('form-gastos')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    let dataInput = document.getElementById('data').value;
    let motivo = document.getElementById('motivo').value;
    let valorInput = document.getElementById('valor').value;
    let categoria = document.getElementById('categoria').value;

    if (!dataInput || !motivo || !valorInput || !categoria) {
      alert('Preencha todos os campos!');
      return;
    }

    let data = formatarDataHora(dataInput);
    let valor = formatarParaNumero(valorInput);

    let gasto = { data, motivo, valor, categoria };

    try {
      let response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(gasto),
        mode: 'no-cors',
      });

      salvarLocalmente(gasto);
      adicionarGastoNaTela(gasto);
      document.getElementById('form-gastos').reset();
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      alert('Erro ao salvar gasto.');
    }
  });

function salvarLocalmente(gasto) {
  let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  gastos.push(gasto);
  localStorage.setItem('gastos', JSON.stringify(gastos));
}

function adicionarGastoNaTela(gasto, index = null) {
  let tabela = document.getElementById('tabela-gastos');
  let total =
    parseFloat(
      document
        .getElementById('total')
        .innerText.replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.'),
    ) || 0;

  total += parseFloat(gasto.valor);

  let row = `<tr data-index="${index}">
    <td class="value-td">${gasto.data}</td>
    <td class="value-td">${gasto.motivo}</td>
    <td class="value-td">R$ ${formatarParaMoeda(gasto.valor)}</td>
    <td class="value-td"><span class="categoria ${gasto.categoria}">${
    gasto.categoria
  }</span></td>
    <td><button class="btn btn-danger btn-sm" onclick="removerGasto(this)"><i class="fas fa-trash"></i></button></td>
</tr>`;

  tabela.innerHTML += row;
  document.getElementById('total').innerText = `R$ ${formatarParaMoeda(total)}`;
}

function removerGasto(botao) {
  let linha = botao.parentNode.parentNode;
  let index = linha.getAttribute('data-index');

  let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  gastos.splice(index, 1); // Remove o item do array

  localStorage.setItem('gastos', JSON.stringify(gastos)); // Atualiza o LocalStorage
  linha.remove();


  let totalAtual = 0;
  gastos.forEach((gasto) => (totalAtual += parseFloat(gasto.valor)));
  document.getElementById('total').innerText = `R$ ${formatarParaMoeda(
    totalAtual,
  )}`;
}

function formatarDataHora(dataHora) {
  let dataObj = new Date(dataHora);
  let dia = String(dataObj.getDate()).padStart(2, '0');
  let mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  let ano = dataObj.getFullYear();
  let horas = String(dataObj.getHours()).padStart(2, '0');
  let minutos = String(dataObj.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function formatarParaNumero(valor) {
  return valor.replace(/\./g, '').replace(',', '.');
}

function formatarParaMoeda(valor) {
  return parseFloat(valor)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace('R$', '')
    .trim();
}

document.getElementById('valor').addEventListener('input', function (e) {
  let valor = e.target.value.replace(/\D/g, '');
  valor = (parseFloat(valor) / 100).toFixed(2);
  e.target.value = valor.replace('.', ',');
});

function pesquisarGastos() {
  let termo = document.getElementById('search').value.toLowerCase();
  let linhas = document.querySelectorAll('#tabela-gastos tr');
  linhas.forEach((linha) => {
    linha.style.display = linha.innerText.toLowerCase().includes(termo)
      ? ''
      : 'none';
  });
}

function filtrarPorPeriodo() {
  let dataInicio = document.getElementById('dataInicio').value;
  let dataFim = document.getElementById('dataFim').value;
  let linhas = document.querySelectorAll('#tabela-gastos tr');

  linhas.forEach((linha) => {
    let dataTexto = linha.cells[0].innerText.split('/').reverse().join('-');
    let dataItem = new Date(dataTexto);
    let inicio = dataInicio ? new Date(dataInicio) : null;
    let fim = dataFim ? new Date(dataFim) : null;

    if ((!inicio || dataItem >= inicio) && (!fim || dataItem <= fim)) {
      linha.style.display = '';
    } else {
      linha.style.display = 'none';
    }
  });
}

async function carregarGastos() {
  let tabela = document.getElementById('tabela-gastos');
  let total = 0;
  tabela.innerHTML = '';

  let gastosLocais = JSON.parse(localStorage.getItem('gastos')) || [];
  gastosLocais.forEach((gasto, index) => {
    total += parseFloat(gasto.valor);
    adicionarGastoNaTela(gasto, index);
  });

  document.getElementById('total').innerText = `R$ ${formatarParaMoeda(total)}`;
}

function formatarParaNumero(valor) {
  return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
}

window.onload = carregarGastos;
