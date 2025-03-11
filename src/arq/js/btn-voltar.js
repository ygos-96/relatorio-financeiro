function goBack() {
    if (document.referrer) {
        // Verifica se há uma página anterior
        window.history.back();
    } else {
        // Caso não haja (acesso direto à página), redireciona para um padrão
        window.location.href = "/";
    }
}