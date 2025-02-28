const API_URL = "https://script.google.com/macros/s/AKfycbzzGVLNPejgNSVfjkd-eJmV00E9WnLq7d6NRO-R6F1mtRREgKyw2HCAGcUzMqIcgiKi/exec";  // Substitua pela nova URL do Google Apps Script

document.getElementById("form-ganhos").addEventListener("submit", async function (event) {
    event.preventDefault();

    let dataInput = document.getElementById("data").value;
    let motivo = document.getElementById("motivo").value;
    let valorInput = document.getElementById("valor").value;
    let categoria = document.getElementById("categoria").value;

    if (!dataInput || !motivo || !valorInput || !categoria) {
        alert("Preencha todos os campos!");
        return;
    }

    let data = formatarDataHora(dataInput);
    let valor = formatarParaNumero(valorInput);

    let ganho = { data, motivo, valor, categoria };

    try {
        
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(ganho),
            mode: "no-cors"
        });

        salvarLocalmente(ganho);
        adicionarGanhoNaTela(ganho);
        document.getElementById("form-ganhos").reset();
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        alert("Erro ao salvar ganho.");
    }
});

function salvarLocalmente(ganho) {
    let ganhos = JSON.parse(localStorage.getItem("ganhos")) || [];
    ganhos.push(ganho);
    localStorage.setItem("ganhos", JSON.stringify(ganhos));
}

function adicionarGanhoNaTela(ganho, index = null) {
    let tabela = document.getElementById("tabela-ganhos");
    let total = parseFloat(document.getElementById("total").innerText.replace("R$ ", "").replace(".", "").replace(",", ".")) || 0;

    total += parseFloat(ganho.valor);

    let row = `<tr data-index="${index}">
        <td>${ganho.data}</td>
        <td>${ganho.motivo}</td>
        <td><span class="categoria ${ganho.categoria}">${ganho.categoria}</span></td>
        <td>R$ ${formatarParaMoeda(ganho.valor)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removerGanho(this)"><i class="fas fa-trash"></i></button></td>
    </tr>`;

    tabela.innerHTML += row;
    document.getElementById("total").innerText = `R$ ${formatarParaMoeda(total)}`;
}

function removerGanho(botao) {
    let linha = botao.parentNode.parentNode;
    let index = linha.getAttribute("data-index");

    let ganhos = JSON.parse(localStorage.getItem("ganhos")) || [];
    ganhos.splice(index, 1); 

    localStorage.setItem("ganhos", JSON.stringify(ganhos));
    linha.remove();
    let totalAtual = 0;
    ganhos.forEach(ganho => totalAtual += parseFloat(ganho.valor));
    document.getElementById("total").innerText = `R$ ${formatarParaMoeda(totalAtual)}`;
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
    return parseFloat(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace("R$", "").trim();
}

document.getElementById("valor").addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");
    valor = (parseFloat(valor) / 100).toFixed(2);
    e.target.value = valor.replace(".", ",");
});

function pesquisarGanhos() {
    let termo = document.getElementById("search").value.toLowerCase();
    let linhas = document.querySelectorAll("#tabela-ganhos tr");
    linhas.forEach(linha => {
        linha.style.display = linha.innerText.toLowerCase().includes(termo) ? "" : "none";
    });
}

function filtrarPorPeriodo() {
    let dataInicio = document.getElementById("dataInicio").value;
    let dataFim = document.getElementById("dataFim").value;
    let linhas = document.querySelectorAll("#tabela-ganhos tr");
    
    linhas.forEach(linha => {
        let dataTexto = linha.cells[0].innerText.split("/").reverse().join("-");
        let dataItem = new Date(dataTexto);
        let inicio = dataInicio ? new Date(dataInicio) : null;
        let fim = dataFim ? new Date(dataFim) : null;
        
        if ((!inicio || dataItem >= inicio) && (!fim || dataItem <= fim)) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }
    });
}

function carregarGanhos() {
    let tabela = document.getElementById("tabela-ganhos");
    let total = 0;
    tabela.innerHTML = "";
    let ganhosLocais = JSON.parse(localStorage.getItem("ganhos")) || [];
    ganhosLocais.forEach(ganho => {
        total += parseFloat(ganho.valor);
        let row = `<tr>
            <td>${ganho.data}</td>
            <td>${ganho.motivo}</td>
            <td>${ganho.categoria}</td>
            <td>R$ ${parseFloat(ganho.valor).toFixed(2)}</td>
            <td><button class='btn btn-danger btn-sm' onclick='removerGanho(this)'><i class='fas fa-trash'></i></button></td>
        </tr>`;
        tabela.innerHTML += row;
    });
    document.getElementById("total").innerText = `R$ ${total.toFixed(2)}`;
}

window.onload = carregarGanhos;