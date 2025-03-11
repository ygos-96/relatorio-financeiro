const API_URL = "https://script.google.com/macros/s/AKfycbxjkUOPp1R0Fp0HJlAB6bdobBoYXdk88UZGK9trflDiqeN9ggmm-dSn8lcH2N36yL2T4w/exec";

function normalizeCategoria(categoria) {
    return categoria.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-");
}

async function carregarDados() {
    try {
        let tabelaContainer = document.querySelector(".table-container");
        let scrollPos = tabelaContainer ? tabelaContainer.scrollTop : 0;

        let resposta = await fetch(API_URL, { method: "GET" });
        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);

        let dados = await resposta.json();
        console.log("Dados recebidos:", dados);

        let tabela = document.getElementById("tabela-dados");
        tabela.innerHTML = "";

        let total = 0;

        dados.forEach(item => {
            let linha = document.createElement("tr");
            let categoria = item["Categoria"] ? normalizeCategoria(item["Categoria"]) : "outros";
            let valor = parseFloat(item["Valor"] || 0);
            total += valor;
            linha.innerHTML = `
        <td>${item["Data"] || "-"}</td>
        <td>${item["Investimento"] || "-"}</td>
        <td>${item["Banco"] || "-"}</td>
        <td>% ${item["Rentabilidade"] || "-"}</td>
        <td>${item["Vencimento"] || "-"}</td>
        <td>R$ ${valor.toFixed(2).replace(".", ",")}</td>
    `;

            tabela.appendChild(linha);
        });

        document.getElementById("total").textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

        if (tabelaContainer) {
            tabelaContainer.scrollTop = scrollPos;
        }
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
    }
}

document.getElementById("form-investimento").addEventListener("submit", async function (event) {
    event.preventDefault();

    let data = document.getElementById("data").value;
    let investimento = document.getElementById("investimento").value;
    let banco = document.getElementById("banco").value;
    let rentabilidade = document.getElementById("rentabilidade").value;
    let vencimento = document.getElementById("vencimento").value;
    let valor = document.getElementById("valor").value.replace(",", ".");

    if (!data || !investimento || !banco || !rentabilidade || !vencimento || !valor) {
        alert("Preencha todos os campos!");
        return;
    }

    let investimentos = { data, investimento, banco, rentabilidade, vencimento, valor };
    console.log("Dados a serem enviados:", investimentos);

    try {
        let resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(investimentos)
        });

        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);

        let resultado = await resposta.json();
        console.log("Resposta da API:", resultado);

        let modalElement = document.getElementById("AdicionarInvestimento");
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }

        setTimeout(carregarDados, 1000);
        document.getElementById("form-investimento").reset();
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        alert("Erro ao salvar investimentos.");
    }
});

window.onload = carregarDados;