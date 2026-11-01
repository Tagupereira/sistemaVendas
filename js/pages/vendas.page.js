import { vendasAPI } from "../api/vendas.api.js";
import { indicator } from "../services/indicator.service.js";
import { go } from '../routes/routes.js';
import { toast } from "../components/toast.component.js";
import { conectar, imprimir, gerarCupomESC, gerarSenhaEvento } from "../services/printer.service.js";
import { auth } from '../guards/auth.guard.js';
import { excluir } from "../services/crud.service.js";
import { menu } from "../components/menu.component.js";

const empresa = JSON.parse(localStorage.getItem("empresa"));
const nomecupom = document.getElementById("nomeCupom").innerText = empresa.nome;

const thema = JSON.parse(localStorage.getItem("tema"));
document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('btnMenu').classList.add(`${thema.text}`)
document.getElementById('tituloPage').classList.add(`${thema.text}`)

let vendasCarregadas = [];
let vendaSelecionada = null;

const usuario = JSON.parse( localStorage.getItem('usuario'));
const container = document.getElementById('listaVendas');

container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500">Carregando Vendas...</div>';

async function carregarVendas(){

    const response = await vendasAPI.listar();

    if(!response.success){

        container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Erro ao carregar...</div>';
        return
    }
    if (response.vendas.length === 0){
        container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Nenhuma venda encontrada</div>';
        return
    }

    vendasCarregadas = response.vendas;
    vendasCarregadas.sort(
        (a,b) => new Date(b.data) - new Date(a.data)
    );

    vendasCarregadas.forEach(prepararVenda);

    renderizarVendas(vendasCarregadas);

}

function prepararVenda(venda){

    venda._json = JSON.parse(venda.vendasJson);

    const pagamentos = venda._json.pagamentos || [];

    venda._forma = pagamentos.length > 1
        ? 'PARCIAL'
        : (pagamentos[0] ? pagamentos[0].tipo.toUpperCase() : '—');

    venda._dataLonga = new Date(venda.data).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    venda._busca = normalizar(
        `${venda.cliente || ''} ${venda._dataLonga} ${venda._forma} ${venda.pedido}`
    );

}

// function renderizarVendas(vendas){

//     if (vendas.length === 0) {
//         container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500">Nenhuma venda encontrada</div>';
//         return;
//     }

//     const grupos = {};

//     vendas.forEach(venda => {
//         (grupos[venda._dataLonga] = grupos[venda._dataLonga] || []).push(venda);
//     });

//     let html = '';

//     Object.entries(grupos).forEach(([data, lista]) => {

//         html += `
//             <div class="mb-6">

//                 <h2 class="w-full h-10 ${thema.tailwind} rounded-xl p-2 ${thema.text} text-sm font-bold text-slate-500 mb-3 text-center">
//                     ${data}
//                 </h2>
//         `;

//         lista.forEach(venda => {

//             html += `
//                 <button class="w-full bg-white rounded-2xl shadow p-4 mb-2 text-left venda-card" data-id="${venda.id}">

//                     <div class="flex justify-between">
//                         <span class="font-bold">#${String(venda.pedido).padStart(4, '0')}</span>
//                         <span>${new Date(venda.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
//                     </div>

//                     <div class="mt-2 font-medium">
//                         ${venda.cliente || 'Não identificado'}
//                     </div>

//                     <div class="flex justify-between text-sm text-slate-500 mt-2">
//                         <span>${venda._forma} • ${venda._json.pedido.quantidadeItens} item(s)</span>
//                         <span>${Number(venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
//                     </div>

//                 </button>
//             `;

//         });

//         html += '</div>';

//     });

//     container.innerHTML = html;

// }
function renderizarVendas(vendas){

    if (vendas.length === 0) {
        container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500">Nenhuma venda encontrada</div>';
        return;
    }

    const grupos = {};

    vendas.forEach(venda => {
        (grupos[venda._dataLonga] = grupos[venda._dataLonga] || []).push(venda);
    });

    let html = '';

    Object.values(grupos).forEach(lista => {

        const d = new Date(lista[0].data);

        const dia = d.toLocaleDateString('pt-BR', { day: '2-digit' });
        const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const ano = d.toLocaleDateString('pt-BR', { year: '2-digit' });

        const totalDia = lista.reduce((soma, v) => soma + Number(v.total || 0), 0);

        html += `
            <div class="flex gap-4 mb-5">

                <div class="w-10 shrink-0 text-center pt-3">
                    <div class="text-sm text-slate-400 uppercase">${semana}</div>
                    <div class="text-2xl font-bold text-slate-600">${dia}</div>
                    <div class="text-sm text-slate-400 uppercase">${mes}</div>
                    <div class="text-sm text-slate-400 uppercase">${ano}</div>
                </div>

                <div class="relative flex-1 min-w-0 pl-6 pb-2">

                    <div class="absolute left-0 top-3 bottom-0 w-px bg-slate-200"></div>

                    <div class="text-xs text-slate-400 mb-2">
                        ${lista.length} venda(s) • ${totalDia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
        `;

        lista.forEach(venda => {

            const hora = new Date(venda.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const total = Number(venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            html += `
                <div class="relative mb-3">

                    <div class="absolute -left-[30px] top-5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>

                    <button class="venda-card w-full bg-white rounded-2xl shadow p-3 text-left" data-id="${venda.id}">

                        <div class="flex justify-between">
                            <span class="font-bold">#${String(venda.pedido).padStart(4, '0')}</span>
                            <span class="text-sm text-slate-500">${hora}</span>
                        </div>

                        <div class="font-medium truncate">
                            ${venda.cliente || 'Não identificado'}
                        </div>

                        <div class="flex justify-between text-sm text-slate-500 mt-1">
                            <span>${venda._forma} • ${venda._json.pedido.quantidadeItens} item(s)</span>
                            <span class="font-bold text-slate-700">${total}</span>
                        </div>

                    </button>

                </div>
            `;

        });

        html += '</div></div>';

    });

    container.innerHTML = html;

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

let timerBusca;

document.getElementById('buscarVenda').addEventListener('input', (e) => {

    clearTimeout(timerBusca);

    timerBusca = setTimeout(() => {

        const termo = normalizar(e.target.value);

        renderizarVendas(
            vendasCarregadas.filter(venda => venda._busca.includes(termo))
        );

    }, 250);

});

document.addEventListener('click', (e) => {

        const card = e.target.closest('.venda-card');

        if(!card){
            return;
        }

        const venda = vendasCarregadas.find(v => v.id == card.dataset.id);

        abrirModalVenda(venda);

    }
);

function abrirModalVenda(venda){
        
    vendaSelecionada = venda;

    const vendaCompleta = JSON.parse(venda.vendasJson);
    console.log(vendaCompleta);

    document.body.classList.add('overflow-hidden');

    document.getElementById('modalVenda').classList.remove('hidden');

    document.getElementById('modalPedido').textContent = `Pedido #${String(venda.pedido).padStart(4,'0')}`;

    document.getElementById('modalData').textContent = new Date(venda.data).toLocaleString('pt-BR');

    document.getElementById('modalCliente').textContent = `Cliente: ${venda.cliente || 'Não identificado'}`;

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

            <div class="flex justify-between font-bold"">

                <span >${item.quantidade}x ${item.nome}</span>

                <span>
                    ${(item.quantidade * item.preco).toLocaleString('pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}
                </span>
                
            </div>
            <span class="mt-0">${item.observacao || ""}</span>
            
        `;
    });

    const pagamentos = document.getElementById('modalPagamentos');

    pagamentos.innerHTML = '';

    vendaCompleta.pagamentos.forEach(pagamento => {

        pagamentos.innerHTML += `

            <div class="flex justify-between">

                <span>${pagamento.tipo.toUpperCase()}</span>

                <span>
                     ${Number(pagamento.tipo === 'pendente'? 
                        pagamento.valor : pagamento.recebido).toLocaleString('pt-BR', {
                        style:'currency',
                        currency:'BRL'
                    })}
                </span>
            </div>
        `;
    });

/////////////////////// informação total
    const infoPedidoPg = document.getElementById("totalPedido")
    const obs = document.getElementById("obs")
    obs.innerText="";
        
    infoPedidoPg.innerHTML = '';

    let totalPedido = 0;

    vendaCompleta.pagamentos.forEach(pagamento => {

        if (pagamento.tipo !== 'pendente') {
            totalPedido += Number(pagamento.recebido || 0);
        }

    });
    
    
    infoPedidoPg.innerHTML += `
            
        <div class="flex justify-between">

            <span class="font-bold">Total Recebido</span>

            <span>
                ${Number(totalPedido).toLocaleString('pt-BR', {
                        style:'currency',
                        currency:'BRL'
                    }
                )}
            </span>
        </div>

    `;

    obs.innerHTML += `
        <div class="flex flex-col">

            <span class="font-bold">Observação do pedido</span>
                ${vendaCompleta.obsPedido || ''}
        </div>
    `

/////////////////////// informação do troco

    vendaCompleta.pagamentos.forEach(pagamento => {

        if(pagamento.troco > 0){
            infoPedidoPg.innerHTML += `

            <div class="flex justify-between">

                <span>Troco dinheiro</span>

                <span>
                    ${Number(pagamento.troco).toLocaleString('pt-BR', {
                            style:'currency',
                            currency:'BRL'
                        }
                    )}
                </span>
            </div>
        `;

        }
        
    });

    document.getElementById("btnImprimirVenda").onclick = async () => {
        try{
            toast('Imprimindo', 'info');

            await imprimir(gerarCupomESC(vendaSelecionada));

        }catch(error){
            console.log(error);

            toast("Não foi possivel conectar", "error");
        }
    };

    document.getElementById("btnCompartilharVenda").onclick = () => {

        toast("Compartilhando", "success");

        compartilharVenda(venda);

    };

    document.getElementById("btnExcluirVenda").onclick = async () => {

        await excluir(venda.id, venda);

    };

}
let compartilhando = false;

async function compartilharVenda(venda){

     if (compartilhando) return;

        compartilhando = true;
   
    try{

        await navigator.share({
            title: `Pedido #${venda.pedido}`,
            text: geraCupom(venda)
        });

    }catch(error){
   
        console.error(error)
        const msg = 'Compartilhamento cancelado';
        const cor = "warning";
        toast(msg, cor);

    }
    finally{
        compartilhando = false;
    }

}

function geraCupom(venda){
       
    const vendaCompleta = JSON.parse(venda.vendasJson);
    
    const dataVenda = new Date(venda.data);
    
    const data = dataVenda.toLocaleDateString('pt-BR');
    
    const hora = dataVenda.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
     
    const diaSemana = dataVenda.toLocaleDateString('pt-BR', { weekday:'long' });
     
    const itens = vendaCompleta.pedido.itens.map(item =>
        `- _${item.quantidade}x ${item.nome} Únit: ${item.preco.toLocaleString('pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}_
        ${item.observacao ? '(' + item.observacao + ')' : ''}
        
        *Total: ${(item.preco * item.quantidade).toLocaleString('pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}*`

    ).join('\n\n');

    const pagamentos = vendaCompleta.pagamentos.map(pagamento =>

        `${pagamento.tipo.toUpperCase()}: ${pagamento.valor.toLocaleString(
            'pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}`

    ).join('\n');
    
    const cupom = `
=========================
  ✨ ${empresa.nome} ✨
=========================

${diaSemana}, ${data} - ${hora} 

Cliente: ${venda.cliente}
    
Pedido: *#${String(venda.pedido).padStart(4,'0')}*
========================
*ITENS:*
${itens}

========================
*PAGAMENTO:*

${pagamentos}

VALOR TOTAL: *${Number(venda.total).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}*
========================
obs:
${vendaCompleta.obsPedido || ''}

✨ Obrigado pela preferência!

Cupom de compra - Não é documento fiscal. `;

    return cupom;

}

document.getElementById('fecharModalVenda').addEventListener('click',() => {

        document.getElementById('modalVenda').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
);

const btn = document.getElementById('btnMenu');
btn.addEventListener('click',abrirMenu);

function abrirMenu() {
  menu.open();
  
}

async function init(){
    auth();
    indicator();
    await carregarVendas();
    
}
menu.createMenu();
init();