import { go, goto ,back } from "../routes/routes.js";
import { validarCarrinho, validaCompra } from "../guards/cart.guard.js";
import { conectar, imprimir, gerarCupomESC, gerarSenhaEvento } from "../services/printer.service.js";
import { vendasAPI } from "../api/vendas.api.js";
import { auth } from '../guards/auth.guard.js';
import { toast } from '../components/toast.component.js'

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
        
    return vendasCarregadas.find(v => v.id == venda.id );

}

const btnPrint = document.getElementById("btnImprimir");
btnPrint.addEventListener("click", async ()=>{
    
    btnPrint.textContent = "Aguarde...";
    btnPrint.disabled = true;
    
    toast('Solicitando impressao', 'info')
    const venda = JSON.parse(localStorage.getItem('pedido'))
    
    await carregarVendas(venda);
    
    const recebeVendaJson = await carregarVendas(venda);

    if(etapa === 1){

        //console.log(gerarSenhaEvento(venda));
        
        btnPrint.textContent = "Imprimir Comprovante";
        btnPrint.disabled=false;
               
        etapa = 2;
        await imprimir(gerarSenhaEvento(venda));
        return;
        
    }else{

        venda.vendasJson = recebeVendaJson.vendasJson;
        venda.total = recebeVendaJson.total;

        btnPrint.textContent = "Imprimir Comprovante"
                      
        //console.log(gerarCupomESC(venda));
        
        btnPrint.disabled=false;      

        await imprimir(gerarCupomESC(venda));
        
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
    })
    
}

init();
