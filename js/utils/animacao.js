const animacoes = new WeakMap();

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// anima um número do zero até valorFinal, escrevendo no elemento
// "formatar" diz como mostrar o número (moeda, inteiro, etc.)
export function animarNumero(elemento, valorFinal, formatar, duracao = 700) {

    // cancela a animação anterior desse mesmo elemento
    cancelAnimationFrame(animacoes.get(elemento));

    if (reduzirMovimento || !valorFinal) {
        elemento.innerText = formatar(valorFinal);
        return;
    }

    const inicio = performance.now();

    function passo(agora) {

        const progresso = Math.min((agora - inicio) / duracao, 1);

        // começa rápido e vai desacelerando
        const suave = 1 - Math.pow(1 - progresso, 3);

        elemento.innerText = formatar(valorFinal * suave);

        if (progresso < 1) {
            animacoes.set(elemento, requestAnimationFrame(passo));
        } else {
            elemento.innerText = formatar(valorFinal);
        }

    }

    animacoes.set(elemento, requestAnimationFrame(passo));

}