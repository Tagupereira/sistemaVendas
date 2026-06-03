export function validarCarrinho(){

    const carrinho = JSON.parse(localStorage.getItem('carrinho')|| '[]');

    return carrinho.length > 0;

}

export function validaCompra(){
    const resumoPedido = JSON.parse(localStorage.getItem('resumoPedido'));

    return resumoPedido.status === 1;
}