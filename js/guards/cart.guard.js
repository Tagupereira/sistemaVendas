export function validarCarrinho(){

    const carrinho = JSON.parse(localStorage.getItem('pedido')|| '[]');

    return carrinho.carrinho > 0;

}

export function validaCompra(){
    const pedido = JSON.parse(localStorage.getItem('pedido')||'[]');
      
    return pedido.status === 1;
}
export function validarPaginaPagamento(){

    const carrinho = JSON.parse(localStorage.getItem('carrinho')|| '[]');

    return carrinho.length > 0;

}