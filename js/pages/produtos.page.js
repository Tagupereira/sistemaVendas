import { ProdutoAPI } from '../api/produtos.api.js';
import { iniciarCarrinho, carregarCarrinho, atualizarCarrinhoUI, adicionarCarrinho} from '../services/carrinho.service.js';
import { go, goto } from '../routes/routes.js';
import { indicator } from "../services/indicator.service.js";
import { paymentAPI } from '../api/payments.api.js';
import { auth } from '../guards/auth.guard.js';
import { toast } from '../components/toast.component.js';

auth();

document.getElementById("back").addEventListener("click",()=>{
  go("login");
})

let produtos = [];
const user = JSON.parse(localStorage.getItem('usuario'));

document.getElementById('bemvindo').textContent=`Olá ${user.user.toUpperCase()}`

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
 
  const container = document.getElementById('listaProdutos');

  container.innerHTML = '';
  container.innerHTML = `
    <button id="adicAvulso" class="bg-blue-500 text-white w-full rounded-xl p-3">
      + Item Avulso 
    </button>`

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
      
      modalObs(itemCart);

    });
  });
  document.getElementById("adicAvulso").onclick=() =>{
    abrirAvulso()
  }
  
}

function modalObs(item){

  document.getElementById("obsProduto").value = "";

  const modalObs = document.getElementById("modalObs");
  modalObs.classList.remove("hidden");
  
  const confirmarObs = document.getElementById("confirmarObs");
  const cancelarObs = document.getElementById("cancelarObs");

  confirmarObs.onclick=()=>{

    const inputObs = document.getElementById("obsProduto").value.trim();
    item.idCarrinho = crypto.randomUUID(),   
    item.observacao = inputObs;
    
    modalObs.classList.add("hidden");

    adicionarCarrinho(item);

    toast(`item ${item.nome} adicionado`, "success");

  }

  cancelarObs.onclick=()=>{
    
    modalObs.classList.add("hidden");

    toast("item cancelado", "info");

  }


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

async function listarPagamentos(){
  const tipos = {}
  const response = await paymentAPI.listarTipos();

  tipos.payments = response.tipos;

  localStorage.setItem("payments", JSON.stringify(tipos));
  
}

const btn = document.getElementById('btnMenu');

const menu = document.getElementById('menuLateral');

const overlay = document.getElementById('menuOverlay');

const btnFechar = document.getElementById('fechar');

const produtoFechar = document.getElementById('pageProdutosClose');

btn.addEventListener('click', abrirMenu);

overlay.addEventListener('click', fecharMenu);

btnFechar.addEventListener('click', fecharMenu);

produtoFechar.addEventListener('click', fecharMenu);

function abrirMenu() {

  menu.classList.add('aberto');

  overlay.classList.add('aberto');

}

function fecharMenu() {

  menu.classList.remove('aberto');

  overlay.classList.remove('aberto');

}

document.querySelectorAll('[data-page]')
  .forEach(item => {item.addEventListener('click', () => {
      
      const page = item.dataset.page;

      menu.classList.remove('aberto');
      go(page);

    }
  );
});

function abrirAvulso(){
  document.getElementById('modalAvulso').classList.remove('hidden');
}

const valorInput = document.getElementById("valorAvulso")
  
  valorInput.addEventListener('input', ()=>{
    let valor = valorInput.value.replace(/\D/g,'');
    
    valor = Number(valor) / 100;

    valorInput.value = valor.toLocaleString('pt-BR',{
    
      style:'currency',
      currency:'BRL'

    });
  });

document.getElementById('confirmarAvulso').onclick=()=>{

  const nome = document.getElementById('nomeAvulso').value.trim();

  const valor = Number(document.getElementById('valorAvulso').value.replace('R$','').replace(/\./g,'').replace(',','.').trim());

  if(!nome || !valor){
    document.getElementById('modalAvulso').classList.add('hidden');
    return;

  }

  adicionarCarrinho({id:crypto.randomUUID(), idCarrinho:'AVULSO-'+ crypto.randomUUID(), 
    nome,

    preco:valor,

    quantidade:1,

    avulso:true

  });

  document.getElementById('nomeAvulso').value='';

  document.getElementById('valorAvulso').value='';

  document.getElementById('modalAvulso').classList.add('hidden');

};

function init(){

  indicator();
  carregarProdutos();
  carregarCarrinho();
  iniciarCarrinho();
  atualizarCarrinhoUI();
  listarPagamentos();
 
};

setInterval(() => {

  indicator();   

}, 10000);

init();