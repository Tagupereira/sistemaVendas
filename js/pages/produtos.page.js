import { ProdutoAPI } from '../api/produtos.api.js';
import { iniciarCarrinho, carregarCarrinho, atualizarCarrinhoUI, adicionarCarrinho} from '../services/carrinho.service.js';
import { go, goto } from '../routes/routes.js';
import { indicator } from "../services/indicator.service.js";

document.getElementById("back").addEventListener("click",()=>{
  go("login");
})


let produtos = [];

async function carregarProdutos() {

  const container = document.getElementById('listaProdutos');

  container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Carregando Lista...</div>';

  const response = await ProdutoAPI.listar();
  
  
  if(!response.success){
    
    container.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Erro ao carregar...</div>';
    return
  }

  produtos = response.produtos;

  renderizarProdutos(produtos)
}

function renderizarProdutos(produtos) {
  //console.log("response: ", produtos);

  const container = document.getElementById('listaProdutos');


  container.innerHTML = '';

  produtos.forEach(produto => {

    const nome = produto.nome.toUpperCase()

    container.innerHTML += `
      <div class="bg-white rounded-3xl shadow p-4 flex flex-column justify-between items-center">
        <div class="w-[60%]">
          <h3 class="font-bold text-lg">
            ${nome}
          </h3>

          <p class="text-slate-500">
            ${produto.descricao}
          </p>
          <p class="text-slate-500">
            Estoque: ${produto.estoque}
          </p>

          <div class="flex justify-between mt-4">
          
            <span class="font-bold text-2xl">
              R$ ${produto.preco.toFixed(2)}
            </span>

          </div>
        </div>
        <button data-id="${produto.id}" class="adicionar w-20 h-20 bg-blue-600 text-white text-4xl font-light rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition">
          <span class="material-symbols-outlined">add_shopping_cart</span>
        </button>

      </div>
    `;

  });

  const adicionarItem = document.querySelectorAll('.adicionar');

  adicionarItem.forEach(btn => {


    btn.addEventListener("click", () => {

      const itemId = Number(btn.dataset.id);
      const itemCart = produtos.find(produto => produto.id === itemId);
      console.log(itemCart);

      adicionarCarrinho(itemCart);

    });
  });
  
}

const btnFinalizarPedido = document.getElementById("finalizarPedido");
btnFinalizarPedido.addEventListener("click", ()=>{

    go("pagamentos");
})


function normalizar(texto) {
  return texto
  ?.toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');
}

document.getElementById('pesquisa').addEventListener('input', (e) => {
  
  const termo = normalizar(e.target.value);;
  
  const filtrados = produtos.filter(produto => {
    
    return (
      normalizar(produto.nome).includes(termo) ||
      normalizar(produto.descricao).includes(termo) ||
      String(produto.id).includes(termo) ||
      String(produto.id_categoria).includes(termo) ||
      normalizar(produto.tipo_de_venda).includes(termo)
    );
    
  });
  
  renderizarProdutos(filtrados);
  
});

function init(){

  indicator();
  carregarProdutos();
  carregarCarrinho();
  iniciarCarrinho();
  atualizarCarrinhoUI();

};

setInterval(() => {

  indicator();   

}, 10000);

init();