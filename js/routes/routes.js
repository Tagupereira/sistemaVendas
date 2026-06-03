export const Routes = {

    login: '/index.html',

    produtos: '/produtos.html',

    clientes: '/clientes.html',

    pagamentos: '/payments.html',

    concluido: '/concluido.html',

    pedidos: '/pedidos.html',

    categorias: '/categorias.html',

    configuracoes: '/configuracoes.html'

};

export const go = (page) => window.location.replace(Routes[page]);

export function back(){

    window.history.back();

}

export function goto(n){
    history.go(n)
}