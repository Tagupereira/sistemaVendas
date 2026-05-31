export const Routes = {

    login: '/index.html',

    produtos: '/produtos.html',

    clientes: '/clientes.html',

    pedidos: '/pedidos.html',

    categorias: '/categorias.html',

    configuracoes: '/configuracoes.html'

};

export const go = (page) => window.location.href = Routes[page];

export function back(){

    window.history.back();

}