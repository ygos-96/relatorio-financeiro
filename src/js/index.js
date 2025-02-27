document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.querySelector(".imagem-inicio").style.display = "none";
        let menu = document.querySelector(".acesso");
        menu.style.display = "block";

        let input = document.querySelector(".acesso input");
        input.classList.add("fade-in");
    }, 2000);

    function login() {
        const senhaCorreta = "172172"; 
        let inputSenha = document.getElementById("password");

        if (inputSenha.value === senhaCorreta) {
            window.location.href = "menu.html";
        } else {
            inputSenha.classList.add("input-error");

    
            setTimeout(() => {
                inputSenha.classList.remove("input-error");
            }, 2000);

            var myModal = new bootstrap.Modal(document.getElementById('accessDeniedModal'));
            myModal.show();
        }
    }

    document.getElementById("login-btn").addEventListener("click", login);

    document.getElementById("password").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            login();
        }
    });
});