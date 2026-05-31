import { ProdutoAPI } from '../api/produtoApi.js';
import { iniciarCarrinho, carregarCarrinho, atualizarCarrinhoUI, adicionarCarrinho} from '../services/carrinho.service.js';

let produtos = [];

async function carregarProdutos() {

  const response = await ProdutoAPI.listar();

  produtos = response.produtos;

  renderizarProdutos(produtos)
}

function renderizarProdutos(produtos) {
  console.log("response: ", produtos);

  const container = document.getElementById('listaProdutos');


  container.innerHTML = '';

  produtos.forEach(produto => {

    const nome = produto.nome.toUpperCase()

    container.innerHTML += `
      <div class="bg-white rounded-3xl shadow p-4 flex flex-column justify-between">
        <div>
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
          +
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


carregarCarrinho();
iniciarCarrinho();
atualizarCarrinhoUI();
carregarProdutos();

// document.getElementById('pesquisa').addEventListener('input', (e) => {

//     const termo = e.target.value.toLowerCase();

//     const filtrados = produtos.filter(produto => 
//       produto.nome.toLowerCase().includes(termo) ||
//       produto.descricao.toLowerCase().includes(termo) ||
//       String(produto.id_categoria).includes(termo)
//       );

//     renderizarProdutos(filtrados);

//   });

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