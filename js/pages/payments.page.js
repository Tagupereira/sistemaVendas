import { go, goto } from "../routes/routes.js";
import { validarPaginaPagamento } from "../guards/cart.guard.js";
import { adicionarPagamento, removerPagamento, getPagamentos, getTotalPago, getValorRestante, salvarPagamentos, getVenda, carregarPagamentos, limparPagamentos } from "../services/payments.service.js";
import { toast } from "../components/toast.component.js";
import { indicator } from "../services/indicator.service.js";
import { vendasAPI } from "../api/vendas.api.js";
import { API_URL } from "../api/api.js";
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';

let tiposPagamentos = [];

const carrinho = validarPaginaPagamento();

if(carrinho === false){
        
    go("produtos");

}

const confirmar = document.getElementById("btnConfirmarVenda");
const valorTotal = document.getElementById("valorTotal");

confirmar.addEventListener("click", async()=>{

   
    if(getValorRestante() > 0){

        const msg = "Pagamento incompleto";
        const cor = "error";
         toast(msg, cor);

        return;

    }

   await salvarVenda();
})

document.getElementById("back").addEventListener("click",()=>{
  go("produtos");
})

function listaResumo(){

    const lista = JSON.parse(localStorage.getItem("resumoPedido"));

    const listaItens = document.getElementById("listaItens");

    listaItens.innerHTML = '';

    animarValor(valorTotal, lista.total);

    lista.itens.forEach(item => {

        listaItens.innerHTML += `
            <div class="flex items-center justify-between">

                <span>
                    ${item.quantidade}x ${item.nome}
                </span>

                <span>
                    ${(item.preco * item.quantidade)
                        .toFixed(2)}
                </span>

            </div>
        `;

    });

}

function animarValor(elemento, valorFinal, duracao = 1000) {

    let valorAtual = 0;

    const incremento = valorFinal / (duracao / 55);

    const timer = setInterval(() => {

        valorAtual += incremento;

        if(valorAtual >= valorFinal){

            valorAtual = valorFinal;

            clearInterval(timer);

        }

        elemento.textContent =
            valorAtual.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

    }, 16);

}

async function carregarTiposPagamento() {

    const icones = {
        pix: 'qr_code',
        dinheiro: 'payments',
        credito: 'credit_card',
        debito: 'account_balance_wallet',
        pendente: 'schedule'
    };

    const payments = JSON.parse(localStorage.getItem("payments")); 
    
    const container = document.getElementById('tiposPagamento');

    container.innerHTML = '';

    payments.payments.forEach(tipo => {

        container.innerHTML += `
            <button class=" tipo-pagamento flex flex-col items-center justify-center gap-2 h-28 border-2 border-slate-200 rounded-2xl bg-white shadow-sm transition hover:shadow-md" data-id="${tipo.id}">

                <span class="material-symbols-outlined text-4xl">
                    ${icones[tipo.tipo_pagamento]}
                </span>

                <span class="font-semibold text-sm uppercase">
                    ${tipo.tipo_pagamento}
                </span>

            </button>
        `;
    });

    tiposPagamentos = payments.payments;

    iniciarEventosPagamento();
}

function iniciarEventosPagamento() {

    document.querySelectorAll('.tipo-pagamento').forEach(card => {

        card.addEventListener('click', () => {

            document.querySelectorAll('.tipo-pagamento').forEach(c => {

                c.classList.remove(
                    'border-green-500',
                    'bg-green-50',
                    'text-green-700'
                );

            });

            card.classList.add(
                'border-green-500',
                'bg-green-50',
                'text-green-700'
            );
                
            const tipo =
                tiposPagamentos.find(
                    t => t.id == card.dataset.id
                );

            
            const pagamentoSelecionado =  tiposPagamentos.find(tipo => tipo.id == card.dataset.id);
               
            abrirModalPagamento(tipo);            
            atualizarResumoPagamento();

        }


        );

    });
}

function atualizarResumoPagamento(){

    const pagamentos = getPagamentos();

    const container = document.getElementById('listaPagamentos');
    
    container.innerHTML = '';

    pagamentos.forEach((pagamento,index) => {

        container.innerHTML += `

            <div class="flex justify-between items-center pl-3 pr-3 rounded-xl">

                <div class="w-full mr-5 flex flex-rown bg-slate-50 justify-between items-center">

                    <div class="font-medium">

                        ${pagamento.tipo.toUpperCase()}

                    </div>

                    <div class="text-sm text-slate-500">

                        ${pagamento.valor.toLocaleString(
                            'pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}

                    </div>

                </div>

                <button class="removerPagamento text-red-500" data-index="${index}">
                    ✕
                </button>

            </div>

        `;

    });

    atualizarTotais();  

}

function atualizarTotais(){

    const resumoPedido = JSON.parse(localStorage.getItem('resumoPedido'));

    const totalPedido = resumoPedido.total;

    const totalPago = getTotalPago();

    const restante = totalPedido - totalPago;

    document.getElementById('valorPago').textContent = totalPago.toLocaleString('pt-BR',
        {
            style:'currency',
            currency:'BRL'
        }
    );

    document.getElementById('valorRestante').textContent =restante.toLocaleString('pt-BR',
        {
            style:'currency',
            currency:'BRL'
        }
    );

     if(totalPedido-totalPago < 0){
            document.getElementById("tituloTroco").innerText = "Troco";
        }else{document.getElementById("tituloTroco").innerText = "Restante";}

    validarPagamento();

}

function validarPagamento(){

    const resumoPedido = JSON.parse(localStorage.getItem('resumoPedido'));

    const totalPedido = resumoPedido.total;

    const totalPago = getTotalPago();

    const btn = document.getElementById('btnConfirmarVenda');

    if(totalPago >= totalPedido){
       
        if(totalPedido-totalPago < 0){
            document.getElementById("tituloTroco").innerText = "Troco";
        }else{
            document.getElementById("tituloTroco").innerText = "Restante";
        }

        btn.disabled = false;
        btn.classList.remove('opacity-50');



        return;
    }

    btn.disabled = true;
    btn.classList.add('opacity-50');


}

document.getElementById('listaPagamentos').addEventListener('click', (e) => {

    if(e.target.classList.contains('removerPagamento')){

        removerPagamento(Number(e.target.dataset.index));

    }

    atualizarResumoPagamento();

});

async function salvarVenda(){
    
    showLoading();

    const venda = getVenda(document.getElementById('nomeCliente').value);
    const pedido = {};

    localStorage.setItem('ultimaVenda', JSON.stringify(venda));
       
    try {
               
        const response = await vendasAPI.salvar(venda);
                
        if(!response.success){

            throw new Error(
                'Erro ao salvar venda'
            );
        }
        
        
        pedido.numPedido = response.pedido;
        pedido.status = 1;
        pedido.carrinho = 1;
          
        localStorage.setItem("pedido", JSON.stringify(pedido));
    
        limparPagamentos();
        localStorage.removeItem("carrinho");
        localStorage.removeItem("resumoPedido");
        localStorage.removeItem("ultimaVenda");

        go("concluido");

    } catch(error){

        console.error(error);

        hideLoading();
        
        const msg = 'Venda salva localmente. Será enviada depois.';
        const cor = "warning";
        toast(msg, cor);

    }
    
}

let pagamentoSelecionado = null;

function abrirModalPagamento(tipo){

    pagamentoSelecionado = tipo;

    const restante = getValorRestante();

    document.getElementById(
        'tituloPagamento'
    ).textContent =
        `Pagamento - ${tipo.tipo_pagamento}`;

    document.getElementById(
        'valorPagamento'
    ).value =
        restante.toFixed(2);

    const boxTroco =
        document.getElementById(
            'trocoPagamento'
        );

    document.getElementById(
        'modalPagamento'
    ).classList.remove(
        'hidden'
    );

}

document.getElementById('confirmarPagamento').addEventListener('click', () => {

    const valor = Number(document.getElementById('valorPagamento').value);

    const restante = getValorRestante();

    if(valor <= 0){

        toast(
            'Valor inválido',
            'warning'
        );

        return;
    }

    if(
        pagamentoSelecionado.tipo_pagamento !== 'dinheiro' &&
        valor > restante
    ){

        toast(
            'Valor maior que o restante',
            'warning'
        );

        return;
    }
        

    adicionarPagamento(
        pagamentoSelecionado,
        valor
    );

    atualizarResumoPagamento();

    fecharModalPagamento();

});

function fecharModalPagamento(){

   document.getElementById(
        'modalPagamento'
    ).classList.add(
        'hidden'
    );

    document.getElementById(
        'trocoPagamento'
    ).classList.add(
        'hidden'
    );

}

document.getElementById('cancelarPagamento').addEventListener('click', fecharModalPagamento);

function atualizarTroco(){

        
    if(
        !pagamentoSelecionado ||
        pagamentoSelecionado.tipo_pagamento !== 'dinheiro'
    ){
        return;
    }

    const recebido = Number(
        document.getElementById(
            'valorPagamento'
        ).value
    );

    const restante =
        getValorRestante();

    const troco =
        recebido - restante;

    const boxTroco =
        document.getElementById(
            'trocoPagamento'
        );

    if(troco > 0){

        boxTroco.textContent =
            `Troco: ${troco.toLocaleString(
                'pt-BR',
                {
                    style:'currency',
                    currency:'BRL'
                }
            )}`;

        boxTroco.classList.remove(
            'hidden'
        );

    }else{

        boxTroco.classList.add(
            'hidden'
        );

    }

}

function init(){
    
    indicator();

    carregarPagamentos();

    listaResumo();

    carregarTiposPagamento();

    atualizarResumoPagamento();  

    document.getElementById('valorPagamento').addEventListener('input', atualizarTroco);

}
setInterval(() => {

    indicator();    

}, 10000);

init();
