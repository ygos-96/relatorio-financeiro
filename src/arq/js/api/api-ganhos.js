const API_URL = "https://script.google.com/macros/s/AKfycbwMqL3ZjiTynUoFFWoBgxAHcTjapK3ImAgI2p0B6ES8T9xfSHm4bZ8gGE1Wjs4J4Kf83g/exec";

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
            
            let categoriaTd = document.createElement("td");
            let categoriaSpan = document.createElement("span");
            categoriaSpan.textContent = item["Categoria"] || "Outros";
            categoriaSpan.classList.add(`categoria-${categoria}`);
            categoriaTd.appendChild(categoriaSpan);
            
            linha.innerHTML = `
                <td>${item["Data"] || "-"}</td>
                <td>${item["Motivo"] || "-"}</td>
                <td>R$ ${valor.toFixed(2).replace(".", ",")}</td>
            `;
            
            linha.appendChild(categoriaTd);
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

document.getElementById("form-ganhos").addEventListener("submit", async function (event) {
    event.preventDefault();

    let data = document.getElementById("data").value;
    let motivo = document.getElementById("motivo").value;
    let valor = document.getElementById("valor").value.replace(",", ".");
    let categoria = normalizeCategoria(document.getElementById("categoria").value);

    if (!data || !motivo || !valor || !categoria) {
        alert("Preencha todos os campos!");
        return;
    }

    let ganho = { data, motivo, valor, categoria };
    console.log("Dados a serem enviados:", ganho);

    try {
        let resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(ganho)
        });

        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);

        let resultado = await resposta.json();
        console.log("Resposta da API:", resultado);

        let modalElement = document.getElementById("AdicionarGanho");
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }

        setTimeout(carregarDados, 1000);
        document.getElementById("form-ganhos").reset();
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        alert("Erro ao salvar ganho.");
    }
});

window.onload = carregarDados;