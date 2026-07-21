export const Routes = {

    login: '/index.html',

    produtos: '/produtos.html',

    produtosAdmin: '/produtos-admin.html',

    pagamentos: '/payments.html',

    analiseVendas: '/analiseVendas.html',

    pendentes: '/pendentes.html',

    concluido: '/concluido.html',
    
    vendas: '/vendas.html',

    categorias: '/categorias.html',

    configuracoes: '/configuracoes.html',

    conta: '/configConta.html'


};

//export const go = (page) => window.location.href = Routes[page];
export const go = (page) => window.location.replace(Routes[page]);

export function back(){

    window.history.back();

}

export function goto(n){
    history.go(n)
}