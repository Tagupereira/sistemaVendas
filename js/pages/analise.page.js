import { vendasAPI } from '../api/vendas.api.js';
import { go, goto } from "../routes/routes.js";

let vendas = [];

window.addEventListener('load', async () => {
        await carregarHoje();
    }
);

document.getElementById("back").addEventListener("click",()=>{
  go("produtos");
})

async function carregarHoje() {
    
    try {
        
        const response = await vendasAPI.listar();
        
        vendas=response.vendas;

        const hoje = new Date();

        const vendasHoje = vendas.filter(venda => {

            const data = new Date(venda.data);

            return (data.toDateString() === hoje.toDateString());

        });

        renderResumo(vendasHoje);

    }

    catch (e) {

        console.error(e);

    }

}

function renderResumo(vendas) {
        
    const pedidos = vendas.length;

    const recebido = vendas.reduce((total, v) => total + Number(v.total), 0);

    const ticket = pedidos ? recebido / pedidos : 0;

    document.getElementById('totalPedidos').innerText = pedidos;

    document.getElementById('totalRecebido').innerText =`R$ ${recebido.toFixed(2).replace('.', ',')}`;

    document.getElementById('ticketMedio').innerText =`R$ ${ticket.toFixed(2).replace('.', ',')}`;

    
    renderFormasPagamento(vendas);
    renderProdutos(vendas);

}


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
}

function renderProdutos(vendas) {

    const produtos = {};

    vendas.forEach( v => {
        const venda = JSON.parse(v.vendasJson);

        venda.pedido.itens.forEach(item => {

            if (!produtos[item.nome]) {

                produtos[item.nome] = 0;

            }

            produtos[item.nome] += Number(item.quantidade);

        });

    });

    const ranking = Object.entries(produtos).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const container = document.getElementById('topProdutos');

    container.innerHTML = '';

    ranking.forEach(([nome, qtd], index) => {

        container.innerHTML += `

            <div class="flex justify-between items-center mb-4 ">

                <div>${index + 1}° ${nome}</div>

                <div class="bg-blue-100 px-3 py-1 rounded-xl">${qtd}</div>

            </div>`;

        }

    );

}