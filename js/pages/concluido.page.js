import { go, goto ,back } from "../routes/routes.js";
import { validarCarrinho, validaCompra } from "../guards/cart.guard.js";
import { conectar, imprimir, gerarCupomESC, gerarSenhaEvento } from "../services/printer.service.js";
import { vendasAPI } from "../api/vendas.api.js";
import { auth } from '../guards/auth.guard.js';
import { toast } from '../components/toast.component.js'
//import { modoEvento } from "../config/config.js";
auth();

const carrinho = validarCarrinho();
const status = validaCompra();

let vendasCarregadas = [];
let etapa = '';

if(carrinho === false){
    
    const text = document.getElementById("statusTitle").innerText = "Nada encontrado";
    document.getElementById("btns").innerHTML= "";
    
    go("produtos");
  
}else{

    if(status === false){
        goto(-1);
    }
}

async function carregarVendas(venda){

    const response = await vendasAPI.listar();                 

    vendasCarregadas = response.vendas;
        
    const vendaA = vendasCarregadas.find(v => v.id == venda.id );
    
    localStorage.setItem("vendaJson", JSON.stringify(vendaA));
    
}

const btnPrint = document.getElementById("btnImprimir");

btnPrint.addEventListener("click", async ()=>{
    
    const venda = JSON.parse(localStorage.getItem('pedido'))
    
    const recebeVendaJson = JSON.parse(localStorage.getItem('vendaJson'))

    carregarVendas(venda);

    if(etapa === 1){

        document.getElementById("btnImprimir").textContent = "Aguarde...";
        document.getElementById("btnImprimir").setAttribute("disabled", "disabled");
        toast('Solicitando impressao', 'info');

        console.log(gerarSenhaEvento(venda));
        await imprimir(gerarSenhaEvento(venda));

        document.getElementById("btnImprimir").textContent = "Imprimir Comprovante";
        document.getElementById("btnImprimir").removeAttribute('disabled');

        etapa = 2;
        return;
    }else{
        venda.vendasJson = recebeVendaJson.vendasJson;
        venda.total = recebeVendaJson.total;

        //document.getElementById("btnImprimir").textContent = "Imprimir Comprovante"
        //document.getElementById("btnImprimir").removeAttribute("disabled")
        document.getElementById("btnImprimir").setAttribute("disabled", "disabled")
        document.getElementById("btnImprimir").textContent = "Aguarde..."
        
        
        toast('Solicitando impressao', 'info')

        
        console.log(gerarCupomESC(venda));
        
        await imprimir(gerarCupomESC(venda));
        
        localStorage.removeItem('vendaJson');
    }
})

function buscaModoEvento(){
    const modoEvento = JSON.parse(localStorage.getItem("modoEvento"))
    
    if(modoEvento){
        etapa=1;
        toast("Modo Evento Ativado", "info")
    }else{ 
        etapa=2;
        toast("Modo Evento Desativado", "info")
        document.getElementById("btnImprimir").textContent = "Imprimir Comprovante"
        document.getElementById("btnImprimir").removeAttribute("disabled")
    }
    console.log(etapa);
    
}

function init(){
    
    buscaModoEvento()

    const retornar = document.getElementById("btnNovoPedido");

    const pedido = JSON.parse(localStorage.getItem("pedido"));
    
    const pedidoNumber = "#"+(`${pedido.pedido}`).padStart(4, '0');
    const statusTitle = "Pedido Concluído";
    const statusSubTitle = "Pedido criado com sucesso";
    //localStorage.removeItem("pedido");

    if(pedido){
            
        document.getElementById("statusTitle").innerText = statusTitle;
        document.getElementById("statusSubTitle").innerText = statusSubTitle;
        document.getElementById("numeroPedido").innerText = pedidoNumber;
        
    }else{
        document.getElementById("statusTitle").innerText = "Nada encontrado";
    }

    retornar.addEventListener("click",()=>{
    
        go("produtos")
        localStorage.removeItem("pedido");
        localStorage.removeItem("vendaJson");

    })
    
}

init();
