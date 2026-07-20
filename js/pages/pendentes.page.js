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
let pagamentos = null;
const select = document.getElementById("formaRecebimento");

document.getElementById("back").addEventListener("click", () => {
    go("produtos");
})

const usuario = JSON.parse(localStorage.getItem('usuario'));
const container = document.getElementById('listaPendencias');

container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Carregando Pendencias...</div>';

async function carregarListaPendencias() {

    const response = await vendasAPI.listar();
    
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

        console.log(vendas);
        

        container.innerHTML += `
        
        <div class="bg-white rounded-3xl shadow p-5 mb-5">
            <div class="text-2xl font-bold flex justify-between items-center">
                <span>${cliente}</span>
                <span id="iconSearch" class="material-symbols-outlined">article_shortcut</span>
            </div>
            
            <div class="text-red-500 mb-3 font-bold">
                Total: R$ ${total.toFixed(2)}
            </div>
            
            ${vendas.map(v => `<div class="border-t pt-2 mt-2">
                    <div class="flex justify-between">
                        <strong>Pedido: ${v.pedido}</strong> <span>${new Date(v.data).toLocaleString('pt-BR')}</span>
                    </div>
                
                    <div class="flex justify-between items-center mt-3">
                        <div class="w-[50%]">
                            R$ ${v.total.toFixed(2)}
                        </div>
                    
                        <button data-cliente="${cliente}" data-id="${v.id}"

                            class="w-[50%] btnReceber bg-green-500 text-white rounded-xl px-4 py-2">

                            Receber

                        </button>
                    </div>
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
    pagamentos = JSON.parse(localStorage.getItem("payments"));   

    
    select.innerHTML = '<option value="">Selecione...</option>';
    
    const idPg = pendenciaSelecionada.dados.pagamentos[0].idPagamento;
    pagamentos.payments.forEach(p => {
        
        select.innerHTML += `<option data-id="${p.id}" data-pgId="${idPg}" value="${p.tipo_pagamento}">${p.tipo_pagamento}</option>`
    })

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
        select
        
        const vendaJson = {

            cliente: pendenciaSelecionada.dados.cliente,
            pedido: pendenciaSelecionada.dados.pedido,
            pagamentos: [...pendenciaSelecionada.dados.pagamentos],
            data: new Date().toLocaleString('sv-SE').replace(' ', 'T')
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
        
        const option = select.options[select.selectedIndex];
        
        vendaJson.pagamentos.push(
            {
                idPagamento: option.dataset.pgid,
                id:option.dataset.id,
                tipo: document.getElementById('formaRecebimento').value,
                valor: recebido,    
                troco:0,
                recebido: recebido
            }
        );
                   
        if(pendente.valor===0){
            vendaJson.pagamentos = vendaJson.pagamentos.filter(p=>p.tipo!=='pendente');
        }

        pendenciaSelecionada.vendasJson=JSON.stringify(vendaJson);
          
        const vendaAtualizada = {
            id:pendenciaSelecionada.id,
            data: new Date().toLocaleString('sv-SE').replace(' ', 'T'),
            cliente: pendenciaSelecionada.cliente,
            total: pendenciaSelecionada.total,
            status: pendenciaSelecionada.status,
            pedido: pendenciaSelecionada.pedido,
            vendasJson: JSON.stringify(vendaJson)
        };
          
            
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