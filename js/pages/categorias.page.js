import { categoriaAPI } from "../api/categorias.api.js";
import { indicator } from "../services/indicator.service.js";
import { go, goto } from '../routes/routes.js';
import { toast } from "../components/toast.component.js";
import { auth } from '../guards/auth.guard.js';
import { excluir } from "../services/crud.service.js";
import { showLoading, hideLoading } from '../components/loading.component.js';

console.log(await categoriaAPI.listarCategorias());

const thema = JSON.parse(localStorage.getItem("tema"));
document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('novaCategoria').classList.add(`${thema.tailwind}`);

auth();

document.getElementById("back").addEventListener("click", () => {
  go("produtos");
})

const usuario = JSON.parse(localStorage.getItem('usuario'));
let categoriaList = [];
let categoriaAtual = null;

async function carregar() {

  const response = await categoriaAPI.listarCategorias();

  const categorias = response.lista;

  render(categorias);

}

function render(categorias) {
  
  const lista = document.getElementById('listaCategorias');

  lista.innerHTML = '';

  categorias.forEach(c => {

    lista.innerHTML += `
   
        <div class=" column bg-white rounded-3xl p-5 shadow}">
            <div class="flex justify-between center">
                <div class="flex items-center">
                    <b>${c.categorias.toUpperCase()}</b>
                </div>

                <button onclick="editar(${c.id})" class="${thema.tailwind} text-white p-2 rounded text-center">
                    Editar
                </button>
            </div>

        </div>
    `;
  });

}


window.editar = (id) => {

  categoriaAtual = categoriaList.find(p => p.id == id);

  abrir();

};

window.status = async (id) => {
    const produto = categoriaList.find(p => p.id == id);

    produto.status = produto.status === 'ativo'?'inativo':'ativo';

    await ProdutoAPI.salvar(
      produto
    );

    carregar();

};

function abrir() {

  document.getElementById('modalProduto').classList.remove('hidden');
  
  limparEdit();
  
  if (!categoriaAtual) return;

  nome.value = categoriaAtual.nome;

}

novaCategoria.onclick = () => {

  categoriaAtual = null;

  abrir();

};

salvar.onclick = async () => {

  const novo = {

    id: categoriaAtual?.id ?? Math.max(...categoriaList.map(p => Number(p.id))) + 1,
    
    nome: nome.value

  };

  try{

    showLoading();

    // await ProdutoAPI.salvar(novo);

    modalProduto.classList.add('hidden');
    
    toast("Salvo com sucesso", "success");

    limparFormulario();

    categoriaAtual=null;

    await carregar();

  }
  catch{
    toast("Erro ao salvar", "error");

  }
  finally{
    hideLoading();
  }
};

cancelar.onclick = () => {
  modalProduto.classList.add('hidden');
  categoriaAtual = null;
};


function limparEdit(){
  document.getElementById('nome').value='';

}

function init(){
  indicator()
  carregar(); 
}

init();