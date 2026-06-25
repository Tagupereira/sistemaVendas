import { go, goto } from "../routes/routes.js";
import { toast } from "../components/toast.component.js";
import { indicator } from "../services/indicator.service.js";
import { vendasAPI } from "../api/vendas.api.js";
import { API_URL } from "../api/api.js";
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';
import { auth } from '../guards/auth.guard.js';

auth();

let pendenciasCarregadas = [];
let pendenciaSelecionada = null;

document.getElementById("back").addEventListener("click", () => {
    go("produtos");
})

const usuario = JSON.parse(localStorage.getItem('usuario'));
const container = document.getElementById('listaPendencias');

container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Carregando Pendencias...</div>';

async function carregarListaPendencias() {

    const response = await vendasAPI.listar();
    console.log(response);
    
    if (!response.success) {

        container.innerHTML = `
            <div class="w-full h-[100px] flex justify-center items-center text-slate-500">
                Erro ao carregar..
            </div>
            `;
        return;
    }

    const agrupadas = {};

    response.vendas.forEach(venda => {
        const vendaJson = JSON.parse(venda.vendasJson);
        
        if(!vendaJson.pagamentos){
            return;
        }

        const possuiPendente = vendaJson.pagamentos.some(p => p.tipo === 'pendente' || p.tipo_pagamento === 'pendente');

        if (!possuiPendente) {
            return;

        }

        const cliente = venda.cliente || 'Sem nome';

        if (!agrupadas[cliente]) {
            agrupadas[cliente] = [];

        }

        agrupadas[cliente].push({...venda, dados: vendaJson});

    });

    pendenciasCarregadas = agrupadas;

    console.log(pendenciasCarregadas);
    
    renderPendencias();

}

function renderPendencias() {

    container.innerHTML = '';

    if (Object.keys(pendenciasCarregadas).length === 0) {

        container.innerHTML = `

            <div class="w-full h-[100px] flex justify-center items-center text-slate-500"> 
                Nenhuma pendência encontrada.
            </div>

            `;
        return;

    }

    Object.entries(pendenciasCarregadas).forEach(([cliente, vendas]) => {
    
        const total = vendas.reduce((acc, v) => {
            
            const pendente = v.dados.pagamentos.filter(
                p => p.tipo === 'pendente' || p.tipo_pagamento === 'pendente')
                    .reduce((a, b) => a + b.valor, 0);

                    return acc + pendente;
        }, 0);

        container.innerHTML += `
        <div class="bg-white rounded-3xl shadow p-5 mb-5">
            <div class="text-2xl font-bold">
                ${cliente}
            </div>
            
            <div class="text-red-500 mb-3">
                Total: R$ ${total.toFixed(2)}
            </div>
            
            ${vendas.map(v => `<div class="border-t pt-2 mt-2">
                    <div>
                        Pedido: ${new Date(v.data).toLocaleDateString()}
                    </div>

                    <div>
                        R$ ${v.total}
                    </div>
                    
                    <button data-cliente="${cliente}" data-id="${v.id}"

                        class="btnReceber mt-3 bg-green-500 text-white rounded-xl px-4 py-2">

                        Receber

                    </button>
                </div>`
            ).join('')}
            

        </div>`;

    });

    document.querySelectorAll('.btnReceber').forEach(btn=>{ 
        btn.onclick=()=>{
            const cliente = btn.dataset.cliente;
            const venda = pendenciasCarregadas[cliente].find(v=>v.id==btn.dataset.id);

            abrirRecebimento(cliente,venda);
        };
    });
}

// function abrirRecebimento(cliente,venda){

//     pendenciaSelecionada=venda;

//     document.getElementById('clienteReceber').value=cliente;

//     const saldo = venda.dados.pagamentos.filter(p => p.tipo==='pendente' 
//         || p.tipo_pagamento==='pendente').reduce((acc,p)=>acc+p.valor, 0);

//     document.getElementById('saldoReceber').value=saldo.toLocaleString('pt-BR',{

//         style:'currency',

//         currency:'BRL'

//     }

// );

//     pendenciaSelecionada = {...venda, restante:saldo };

//     document.getElementById('valorRecebido').value='';

//     document.getElementById('modalReceber').classList.remove('hidden');
// }

function abrirRecebimento(cliente,venda){

    pendenciaSelecionada=venda;

    const pendente = venda.dados.pagamentos.find(p=>p.tipo==='pendente');

    document.getElementById('clienteReceber').value=cliente;

    document.getElementById('saldoReceber').value=pendente.valor.toLocaleString('pt-BR',{
            style:'currency',
            currency:'BRL'
        }
    );

    document.getElementById('valorRecebido').value='';

    document.getElementById('modalReceber').classList.remove('hidden');

}

document.getElementById('cancelarRecebimento').onclick=()=>{

    document.getElementById('modalReceber').classList.add('hidden');

};

document.getElementById('valorRecebido').addEventListener('input',()=>{

    const valor = Number(document.getElementById('valorRecebido').value);

    const saldo = pendenciaSelecionada.dados.pagamentos.find(p=>p.tipo === "pendente").valor;

    const restante = Math.max(0, saldo-valor);

    document.getElementById('novoSaldo').textContent=`Restará: R$ ${restante.toFixed(2)}`;

});

document.getElementById('confirmarRecebimento').onclick=async()=>{
 
    try{
       
        showLoading();

        const recebido = Number(document.getElementById('valorRecebido').value);
        
        //const vendaJson = pendenciaSelecionada.dados;
        const vendaJson = {
            cliente: pendenciaSelecionada.dados.cliente,
            pedido: pendenciaSelecionada.dados.pedido,
            pagamentos: [...pendenciaSelecionada.dados.pagamentos],
            data: pendenciaSelecionada.dados.data
        };

        const pendente = vendaJson.pagamentos.find(p=>p.tipo==='pendente');
    
        if(recebido <= 0){
            toast('Valor inválido','warning');
            return;
        }       

        if(recebido > pendente.valor){
            toast('Maior que saldo','warning');
            return;
        }

        pendente.valor -= recebido;
        
        vendaJson.pagamentos.push(
            {
                id: Date.now(),
                tipo: document.getElementById('formaRecebimento').value,
                valor: recebido,    
                recebido: recebido,
                troco:0
            }
        );
               
        if(pendente.valor===0){
            vendaJson.pagamentos = vendaJson.pagamentos.filter(p=>p.tipo!=='pendente');
        }

        pendenciaSelecionada.vendasJson=JSON.stringify(vendaJson);

        const vendaAtualizada = {
            id:pendenciaSelecionada.id,
            data: pendenciaSelecionada.data,
            cliente: pendenciaSelecionada.cliente,
            total: pendenciaSelecionada.total,
            status: pendenciaSelecionada.status,
            pedido: pendenciaSelecionada.pedido,
            vendasJson: JSON.stringify(vendaJson)
        };
        
        console.log(vendaAtualizada);
        
        await vendasAPI.editar(vendaAtualizada);
        
        toast('Pagamento recebido','success');
        
        document.getElementById('modalReceber').classList.add('hidden');
        
        await carregarListaPendencias();

    }
    catch(err){
        toast('Erro','error');
    }
    finally{
        hideLoading();
    }

};

async function init() {

    indicator();
    await carregarListaPendencias();

}
setInterval(() => {

    indicator();

}, 10000);

init();