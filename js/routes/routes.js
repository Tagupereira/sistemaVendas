export const Routes = {

    login: '/index.html',

    produtos: '/produtos.html',

    clientes: '/clientes.html',

    pedidos: '/pedidos.html',

    categorias: '/categorias.html',

    configuracoes: '/configuracoes.html'

};

export function navegar(rota){

    window.location.href = rota;

}