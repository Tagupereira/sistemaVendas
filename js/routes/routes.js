export const Routes = {

    login: '/index.html',

    produtos: '/produtos.html',

    clientes: '/clientes.html',

    pagamentos: '/payments.html',

    concluido: '/concluido.html',

    pedidos: '/pedidos.html',
    
    vendas: '/vendas.html',

    categorias: '/categorias.html',

    configuracoes: '/configuracoes.html'


};

//export const go = (page) => window.location.href = Routes[page];
export const go = (page) => window.location.replace(Routes[page]);

export function back(){

    window.history.back();

}

export function goto(n){
    history.go(n)
}