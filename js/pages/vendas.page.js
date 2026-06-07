import { vendasAPI } from "../api/vendas.api.js";
import { indicator } from "../services/indicator.service.js";
import { go, goto } from '../routes/routes.js';


const container = document.getElementById('listaVendas');

container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Carregando Vendas...</div>';

async function carregarVendas(){

    const response = await vendasAPI.listar();                 
    
    if(!response.success){
    
        container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Erro ao carregar...</div>';
        return
    }
    renderizarVendas(response.vendas);
    
}


function renderizarVendas(vendas){

    const agrupadas = agruparPorData(vendas);

    

    container.innerHTML = '';

    
    Object.entries(agrupadas).forEach(([data, vendas]) => {

        container.innerHTML += `

            <div class="mb-6">

                <h2 class="text-sm font-bold text-slate-500 ml-3 mb-3">

                    ${data}

                </h2>

                <div id="grupo-${data.replaceAll('/','-')}">

                </div>

            </div>

        `;

        const grupo = document.getElementById(`grupo-${data.replaceAll('/','-')}`);

        vendas.forEach(venda => {
            console.log(venda.vendasJson);
            
            const vendaCompleta = JSON.parse(venda.vendasJson);
            console.log(vendaCompleta);
            

            const quantidadeItens = vendaCompleta.pedido.quantidadeItens;  
            console.log(quantidadeItens);
            

            const formaPagamento = vendaCompleta.pagamentos.map(p => p.tipo.toUpperCase()).join(' + ');
            console.log(formaPagamento);
            
            grupo.innerHTML += `

                <button
                    class="w-full bg-white rounded-2xl shadow p-4 mb-2 text-left venda-card"
                    data-id="${venda.id}">

                    <div class="flex justify-between">

                        <span class="font-bold">

                            #${venda.pedido}

                        </span>

                        <span>

                            ${new Date(venda.data).toLocaleTimeString('pt-BR',{
                                    hour:'2-digit',
                                    minute:'2-digit'
                                }
                            )}

                        </span>

                    </div>

                    <div class="mt-2 font-medium">
                        ${venda.cliente || 'Sem nome'}
                    </div>

                    <div class="flex justify-between text-sm text-slate-500 mt-2">

                        <span>
                            ${formaPagamento} • ${quantidadeItens} item(s)
                        </span>

                        <span>

                            ${Number(venda.total)
                                .toLocaleString(
                                    'pt-BR',
                                    {
                                        style:'currency',
                                        currency:'BRL'
                                    }
                                )}

                        </span>

                    </div>

                </button>

            `;

        });

    });

}


function agruparPorData(vendas){

     
    return vendas.reduce((grupo, venda) => {

            const data =
                new Date(venda.data)
                    .toLocaleDateString('pt-BR',{
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            if(!grupo[data]){
                
                grupo[data] = [];

            }

            grupo[data].push(venda);

            return grupo;

        },
        {}
    );

}

async function init(){

    indicator();
    await carregarVendas();


}

init();