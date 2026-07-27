export function admin(){

    const campo = document.getElementById("campoEmpresa");

    let timer;

    campo.addEventListener("touchstart", () => {

        timer = setTimeout(() => {

            const senha = prompt("Digite a senha:");

            if (senha === null) return;

            if (senha === "123456") {

                const gravarDados = document.getElementById("gravarDados");
                const buscarDados = document.getElementById("buscarDados");
                const pesquisa = document.getElementById("campoPesquisa");

                buscarDados.classList.remove("hidden");
                pesquisa.classList.remove("hidden");
            } else {

                toast("Senha inválida", "error");

            }

        }, 10000);

    });

    campo.addEventListener("touchend", () => clearTimeout(timer));
    campo.addEventListener("touchleave", () => clearTimeout(timer));
    campo.addEventListener("touchcancel", () => clearTimeout(timer));
}



