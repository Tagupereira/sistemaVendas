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
    vendasCarregadas.sort(
        (a,b) => new Date(b.data) - new Date(a.data)
    );
    
    renderizarVendas(vendasCarregadas);
    
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

        abrirModalVenda(venda);

    }
);

function abrirModalVenda(venda){

    const vendaCompleta = JSON.parse(venda.vendasJson);

    document.body.classList.add('overflow-hidden');

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

                <span>${item.quantidade}x ${item.nome}</span>

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
  ✨ DELÍCIAS FERNANDES ✨
=========================

${diaSemana}, ${data} - ${hora} 
    
Pedido: *#${String(venda.pedido).padStart(4,'0')}*
========================
*ITENS:*
${itens}
========================
*PAGAMENTO:*

${pagamentos}

VALOR TOTAL: *${Number(venda.total).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}*
========================

✨ Obrigado pela preferência!

Cupom de compra - Não é documento fiscal. `;

    return cupom;

}

document.getElementById('fecharModalVenda').addEventListener('click',() => {

        document.getElementById('modalVenda').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');

    }
);




document
.getElementById(
'btnBluetooth'
)
.addEventListener(
'click',

async ()=>{

try{

const device =
await navigator.bluetooth.requestDevice({

acceptAllDevices:true,

optionalServices:[
'generic_access',
'generic_attribute',
'device_information',
'battery_service'
]

});

alert(
`Dispositivo:
${device.name}`
);

const server =
await device.gatt.connect();

alert(
'Conectado'
);

const services =
await server.getPrimaryServices();

alert(
`Qtd serviços:
${services.length}`
);

for(
const service
of services
){

alert(
`UUID:
${service.uuid}`
);

const chars =
await service.getCharacteristics();

alert(
`Características:
${chars.length}`
);

for(
const char
of chars
){

alert(
`CHAR:
${char.uuid}`
);

}

}

}catch(error){

alert(
error.message
);

}

});








async function init(){

    indicator();
    await carregarVendas();

    
}

init();