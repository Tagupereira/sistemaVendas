export function mascaraMoeda(input) {

    function formatar() {

        let valor = input.value.replace(/\D/g, "");

        if (!valor) {
            input.value = "";
            return;
        }

        valor = Number(valor) / 100;

        input.value = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    input.addEventListener("input", formatar);
}


export function valorDoInput(input) {

    const valor = input.value
        .replace(/\s/g, "")
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".");

    return Number(valor) || 0;
}