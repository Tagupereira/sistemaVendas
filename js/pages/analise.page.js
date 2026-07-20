import { vendasAPI } from '../api/vendas.api.js';
import { go, goto } from "../routes/routes.js";
import { indicator } from "../services/indicator.service.js";
import { auth } from '../guards/auth.guard.js';

auth();

let vendas = [];

window.addEventListener('load', async () => {
        await carregarHoje();
        atualizarBotoes('hoje');
    }
);

document.getElementById("back").addEventListener("click",()=>{
  go("produtos");
});

async function carregarHoje() {
    
    try {
        
        const response = await vendasAPI.listar();
        
        vendas=response.vendas;

        const hoje = new Date();

        const vendasHoje = vendas.filter(venda => {

            const data = new Date(venda.data);

            return (data.toDateString() === hoje.toDateString());

        });

        //filtrarPeriodo('hoje');
        selecionarPeriodo('hoje')
    }

    catch (e) {

        console.error(e);

    }

};

function renderResumo(vendas) {
        
    if(vendas.length===0){

        document.getElementById('totalPedidos').innerText='0';

        document.getElementById('totalRecebido').innerText='R$ 0,00';

        document.getElementById('ticketMedio').innerText='R$ 0,00';

        document.getElementById('formasPagamento').innerHTML=`
        <div class="text-center text-gray-400 py-8">

            Nenhuma venda encontrada

        </div>

        `;

        document.getElementById('topProdutos').innerHTML=`
        <div class="text-center text-gray-400 py-8">

            Nenhum produto vendido

        </div>

        `;

        return;

    }

    const pedidos = vendas.length;

    const recebido = vendas.reduce((total, v) => total + Number(v.total), 0);

    const ticket = pedidos ? recebido / pedidos : 0;

    document.getElementById('totalPedidos').innerText = pedidos;

    document.getElementById('totalRecebido').innerText =`R$ ${recebido.toFixed(2).replace('.', ',')}`;

    document.getElementById('ticketMedio').innerText =`R$ ${ticket.toFixed(2).replace('.', ',')}`;

    renderFormasPagamento(vendas);
    renderProdutos(vendas);

};

function renderFormasPagamento(vendas){
    const formas = {};

    vendas.forEach(v => {
        const venda = JSON.parse(v.vendasJson);

            venda.pagamentos.forEach(p => {

                    if (!formas[p.tipo]) {

                        formas[p.tipo] = 0;

                    }

                    formas[p.tipo] += Number(p.valor);

                }

            );

        }

    );

    const container = document.getElementById('formasPagamento');

    container.innerHTML = '';

    Object.entries(formas).forEach(([tipo, valor]) => {
        container.innerHTML += `
        <div class="flex justify-between mb-4">
            <span>${tipo.toUpperCase()}</span>
            <span class="font-bold">R$ ${valor.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    });
};

function renderProdutos(vendas) {

    const produtos = {};

    vendas.forEach(v => {
        const venda = JSON.parse(v.vendasJson);

        venda.pedido.itens.forEach(item => {
            if (!produtos[item.nome]) {

                produtos[item.nome] = { quantidade: 0, receita: 0 };

            }

            produtos[item.nome].quantidade += Number(item.quantidade);

            produtos[item.nome].receita += item.preco * item.quantidade;

        });

    });

    const ranking = Object.entries(produtos).sort((a, b) => b[1].receita - a[1].receita).slice(0, 5);

    const container = document.getElementById('topProdutos');

    container.innerHTML = '';

    ranking.forEach(([nome, dados], index) => {

        container.innerHTML += `

        <div class="mb-4">
            <div class="flex justify-between">
                <div> ${index + 1}° ${nome}</div>

                <div> ${dados.quantidade} un </div>

            </div>

            <div class="text-green-600 font-semibold text-right">
                R$ ${dados.receita.toFixed(2).replace('.', ',')}
            </div>

        </div> `;

    });

};

document.querySelectorAll('.periodo').forEach(btn => {
    
    btn.addEventListener('click',()=>{

        selecionarPeriodo(btn.dataset.periodo);


    });

});

function selecionarPeriodo(periodo){

    atualizarBotoes(periodo);

    const filtradas = filtrarPeriodo(periodo);

    // DEBUG
    // console.log('Periodo:',periodo);
    // console.log('Resultado:',filtradas);

    renderResumo(filtradas);

}

function filtrarPeriodo(periodo) {
    
    const agora = new Date();

    agora.setHours(0,0,0,0);

    return vendas.filter(v => {

        const venda = JSON.parse(v.vendasJson);

        const data = new Date(venda.data);

        data.setHours(0,0,0,0);

        switch(periodo){

            case 'hoje':

                return (data.getTime() === agora.getTime());

            case 'ontem':

                const ontem = new Date(agora);

                ontem.setDate(ontem.getDate()-1);

                return (data.getTime() === ontem.getTime());

            case 'semana':

                const inicio = new Date(agora);

                inicio.setDate(inicio.getDate()-7);

                return (data >= inicio && data <= agora);

            case 'mes':

                return (data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear());

            case 'ano':

                return (data.getFullYear() === agora.getFullYear());

            default:

                return true;
        }

    });

}

function atualizarBotoes(periodo) {

    document.querySelectorAll('.periodo').forEach(btn => {

        btn.classList.remove('bg-blue-500', 'text-white');

        btn.classList.add('bg-white');

        if (btn.dataset.periodo === periodo) {

            btn.classList.remove('bg-white');

            btn.classList.add('bg-blue-500', 'text-white');
        }
    });
}

function init(){

  indicator();
  
};

setInterval(() => {

  indicator();   

}, 10000);

init();