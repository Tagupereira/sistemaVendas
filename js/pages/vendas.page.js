import { vendasAPI } from "../api/vendas.api.js";
import { indicator } from "../services/indicator.service.js";
import { go, goto } from '../routes/routes.js';
import { toast } from "../components/toast.component.js";

let vendasCarregadas = [];

document.getElementById("back").addEventListener("click",()=>{
  go("produtos");
})

const container = document.getElementById('listaVendas');

container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Carregando Vendas...</div>';

async function carregarVendas(){

    const response = await vendasAPI.listar();                 
    
    if(!response.success){
    
        container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Erro ao carregar...</div>';
        return
    }

    vendasCarregadas = response.vendas;

    renderizarVendas(vendasCarregadas);
    console.log(vendasCarregadas);
    
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
                       
            const vendaCompleta = JSON.parse(venda.vendasJson);
                    
            const quantidadeItens = vendaCompleta.pedido.quantidadeItens;  
           
            const formaPagamento = vendaCompleta.pagamentos.length > 1 ? 'PARCIAL' : vendaCompleta.pagamentos[0].tipo.toUpperCase();
            
            grupo.innerHTML += `

                <button class="w-full bg-white rounded-2xl shadow p-4 mb-2 text-left venda-card" data-id="${venda.id}">

                    <div class="flex justify-between">

                        <span class="font-bold">

                            #${String(venda.pedido).padStart(4, '0')}

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

                            ${Number(venda.total).toLocaleString('pt-BR',
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

            const data = new Date(venda.data).toLocaleDateString('pt-BR',{
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

function normalizar(texto) {
  return texto
  ?.toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');
}

document.getElementById('buscarVenda').addEventListener('input', (e) => {
  
    const termo = normalizar(e.target.value);
  
    const filtradas = vendasCarregadas.filter(venda => {

    const vendaCompleta = JSON.parse(venda.vendasJson);

    const formaPagamento = vendaCompleta.pagamentos.length > 1 ? 'parcial' : vendaCompleta.pagamentos[0].tipo;
    
    const dataFormatada = new Date(venda.data).toLocaleDateString('pt-BR',
            {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        );
    
    return ( 
      normalizar(venda.cliente).includes(termo) ||
      normalizar(dataFormatada).includes(termo) ||
      normalizar(formaPagamento).includes(termo) ||
      String(venda.pedido).includes(termo)
    );
    
  });
  
  renderizarVendas(filtradas);
  
});

document.addEventListener('click', (e) => {

        const card = e.target.closest('.venda-card');

        if(!card){
            return;
        }

        const venda = vendasCarregadas.find(v => v.id == card.dataset.id);

        console.log(venda);

        abrirModalVenda(venda);

    }
);

function abrirModalVenda(venda){

    const vendaCompleta = JSON.parse(venda.vendasJson);

    document.getElementById('modalVenda').classList.remove('hidden');

    document.getElementById('modalPedido').textContent = `Pedido #${String(venda.pedido).padStart(4,'0')}`;

    document.getElementById('modalData').textContent = new Date(venda.data).toLocaleString('pt-BR');

    document.getElementById('modalCliente').textContent = `Cliente: ${venda.cliente || 'Sem nome'}`;

    document.getElementById('modalTotal').textContent = Number(venda.total).toLocaleString('pt-BR',
                    {
                        style:'currency',
                        currency:'BRL'
                    }
                );

    const itens = document.getElementById('modalItens');

    itens.innerHTML = '';

    vendaCompleta.pedido.itens.forEach(item => {

        itens.innerHTML += `

            <div class="flex justify-between">

                <span>${item.quantidade}x${item.nome}</span>

                <span>
                    ${(item.quantidade * item.preco).toLocaleString('pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}
                </span>
            </div>
        `;
    });

    const pagamentos = document.getElementById('modalPagamentos');

    pagamentos.innerHTML = '';

    vendaCompleta.pagamentos.forEach(pagamento => {

        pagamentos.innerHTML += `

            <div class="flex justify-between">

                <span>${pagamento.tipo.toUpperCase()}</span>

                <span>
                    ${Number(pagamento.valor).toLocaleString('pt-BR', {
                            style:'currency',
                            currency:'BRL'
                        }
                    )}
                </span>
            </div>
        `;
    });

    document.getElementById("btnImprimirVenda").addEventListener("click",() => {
        const msg = 'Imprimindo';
        const cor = "info";
        toast(msg, cor);
    })

    document.getElementById("btnCompartilharVenda").addEventListener("click",() => {
        const msg = 'Compartilhando';
        const cor = "success";
        toast(msg, cor);
        
        compartilharVenda(venda)
    })
}

async function compartilharVenda(venda){

    const vendaCompleta = JSON.parse(venda.vendasJson);

    const texto = `
        🍽️ Delícias Fernandes

        Pedido #${String(venda.pedido).padStart(4,'0')}

        Cliente: ${venda.cliente || 'Sem nome'}

        Itens: ${vendaCompleta.pedido.quantidadeItens}

        Total: R$ ${Number(venda.total).toFixed(2)}

        Obrigado pela preferência!
    `;

    try{

        await navigator.share({
            title: `Pedido #${venda.pedido}`,
            text: texto
        });

    }catch(error){

        console.log(
            'Compartilhamento cancelado'
        );

    }

}


document.getElementById('fecharModalVenda').addEventListener('click',() => {

        document.getElementById('modalVenda').classList.add('hidden');

    }
);

async function init(){

    indicator();
    await carregarVendas();


}

init();