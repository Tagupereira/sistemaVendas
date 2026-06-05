import { go, goto ,back } from "../routes/routes.js";
import { validarCarrinho, validaCompra } from "../guards/cart.guard.js";

const carrinho = validarCarrinho();
const status = validaCompra()

if(carrinho === false){
  go("produtos");
  
}else{

    if(status === false){
        goto(-1);
    }
}


const retornar = document.getElementById("btnNovoPedido");

retornar.addEventListener("click",()=>{
    
    go("produtos")
    
    localStorage.removeItem("carrinho");
    localStorage.removeItem("resumoPedido");
    localStorage.removeItem("pagamentos");
    localStorage.removeItem("ultimaVenda");

})