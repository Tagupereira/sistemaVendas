import { go, goto } from "../routes/routes.js";
import { getResumoPedido } from "../services/carrinho.service.js";
import { validarCarrinho, validaCompra } from "../guards/cart.guard.js";

const carrinho = validarCarrinho();

if(carrinho === false){
    
    go("produtos");

}

const confirmar = document.getElementById("btnConfirmarVenda");
const valorTotal = document.getElementById("valorTotal");

confirmar.addEventListener("click",()=>{

    const resumoStatus = JSON.parse(localStorage.getItem("resumoPedido"));
    
    resumoStatus.status = 1;

    localStorage.setItem("resumoPedido",JSON.stringify(resumoStatus))
    
    go("concluido")
})

document.getElementById("back").addEventListener("click",()=>{
  goto(-1);
})

let lista;

function listaResumo(){

    const lista =
        JSON.parse(
            localStorage.getItem(
                "resumoPedido"
            )
        );

    const listaItens =
        document.getElementById(
            "listaItens"
        );

    listaItens.innerHTML = '';

    animarValor(
        valorTotal,
        lista.total
    );

    lista.itens.forEach(item => {

        listaItens.innerHTML += `
            <div class="flex items-center justify-between">

                <span>
                    ${item.quantidade}x ${item.nome}
                </span>

                <span>
                    ${(item.preco * item.quantidade)
                        .toFixed(2)}
                </span>

            </div>
        `;

    });

}

function animarValor(elemento, valorFinal, duracao = 1000) {

    let valorAtual = 0;

    const incremento = valorFinal / (duracao / 55);

    const timer = setInterval(() => {

        valorAtual += incremento;

        if(valorAtual >= valorFinal){

            valorAtual = valorFinal;

            clearInterval(timer);

        }

        elemento.textContent =
            valorAtual.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

    }, 16);

}

listaResumo();