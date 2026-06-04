let pagamentos = [];

export function adicionarPagamento(tipo, valor){

    pagamentos.push({

        id: tipo.id,

        tipo: tipo.tipo_pagamento,

        valor: Number(valor)

    });

    salvarPagamentos();
   
}

export function removerPagamento(index) {

    pagamentos.splice(index, 1);

    salvarPagamentos();
}

export function getPagamentos() {

    return pagamentos;
}

export function getTotalPago(){

    return pagamentos.reduce((soma, pagamento) => soma + pagamento.valor, 0);

}

export function getValorRestante(){

    const resumoPedido = JSON.parse(localStorage.getItem('resumoPedido'));

    return (resumoPedido.total - getTotalPago());

}

export function salvarPagamentos(){

    localStorage.setItem('pagamentos', JSON.stringify(pagamentos));

}

export function getVenda(cliente){

    return {

        cliente,

        pedido: JSON.parse(localStorage.getItem('resumoPedido')),

        pagamentos:[...pagamentos],

        data: new Date().toISOString()

    };

}

export function carregarPagamentos(){

    pagamentos = JSON.parse(localStorage.getItem('pagamentos')) || [];

}

export function limparPagamentos(){

    pagamentos = [];

    localStorage.removeItem(
        'pagamentos'
    );

}

export function getResumoPedido(){

    return JSON.parse(
        localStorage.getItem(
            'resumoPedido'
        )
    );

}