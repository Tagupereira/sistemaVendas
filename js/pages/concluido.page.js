import { go, goto ,back } from "../routes/routes.js";
import { validarCarrinho, validaCompra } from "../guards/cart.guard.js";
import { conectar, imprimir, gerarCupomESC, gerarSenhaEvento } from "../services/printer.service.js";

const carrinho = validarCarrinho();
const status = validaCompra();

if(carrinho === false){
    
    const text = document.getElementById("statusTitle").innerText = "Nada encontrado";
    document.getElementById("btns").innerHTML= "";
    
    go("produtos");
  
}else{

    if(status === false){
        goto(-1);
    }
}
const btnPrint = document.getElementById("btnImprimir");

btnPrint.addEventListener("click", async ()=>{
    const venda = JSON.parse(localStorage.getItem('pedido'))
    // await imprimir(gerarSenhaEvento(venda));
    console.log(venda);
    
})

function init(){

    
    const retornar = document.getElementById("btnNovoPedido");

    const pedido = JSON.parse(localStorage.getItem("pedido"));

    console.log(pedido);
    
    const pedidoNumber = "#"+(`${pedido.pedido}`).padStart(4, '0');
    const statusTitle = "Pedido Concluído";
    const statusSubTitle = "Pedido criado com sucesso";
    //localStorage.removeItem("pedido");

    if(pedido){
    console.log(pedido);
        
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
