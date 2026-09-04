import { categoriaAPI } from "../api/categorias.api.js";
import { indicator } from "../services/indicator.service.js";
import { go, goto } from '../routes/routes.js';
import { toast } from "../components/toast.component.js";
import { auth } from '../guards/auth.guard.js';
import { excluir } from "../services/crud.service.js";
import { showLoading, hideLoading } from '../components/loading.component.js';
import { elementsCategoria } from "../elements/elementos.js";
import { menu } from "../components/menu.component.js";

const thema = JSON.parse(localStorage.getItem("tema"));
document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('novaCategoria').classList.add(`${thema.tailwind}`);
const lista = document.getElementById('listaCategorias');
lista.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Carregando categorias...</div>';
document.getElementById('btnMenu').classList.add(`${thema.text}`)
document.getElementById('tituloPage').classList.add(`${thema.text}`)
document.getElementById('novaCategoria').classList.add(`${thema.text}`)

const usuario = JSON.parse(localStorage.getItem('usuario'));
let categoriaList = [];
let categoriaAtual = null;

async function carregar() {

  const response = await categoriaAPI.listarCategorias();

  const categorias = response.lista;

  render(categorias);

}

function render(categorias) {

  categoriaList = categorias;
  
  if(categorias.length === 0){
    
    lista.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Nenhuma categoria encontrada.</div>';
    return
  }
  lista.innerHTML ='';

  categorias.forEach(c => {

    lista.innerHTML += `
   
        <div class=" column bg-white rounded-3xl p-5 shadow}">
            <div class="flex justify-between center">
                <div class="flex items-center">
                    <b>${c.categorias.toUpperCase()}</b>
                </div>
                <div>
                  <button onclick="editar('${c.id}')" class="bg-orange-500 text-white p-2 rounded text-center">
                      Editar
                  </button>
                  <button onclick="excluir('${c.id}')" class="bg-red-500 text-white p-2 rounded text-center">
                      Excluir
                  </button>
                </div>
            </div>

        </div>
    `;
  });
}

window.editar = (id) => {
    
  categoriaAtual = categoriaList.find(p => p.id == id);

  abrir();

};

window.excluir = async (id) => {
    
  categoriaAtual = categoriaList.find(p => p.id == id);
  console.log(categoriaAtual);
  
  const confirma = confirm(
      `Deseja excluir ${categoriaAtual.categorias}?`
  );
  
  if (!confirma) return;
  
  showLoading();
    
  try{
    
    await categoriaAPI.excluir(id);
    
    toast("Item excluído","success");
    await carregar();   


  }catch{

      toast("Erro ao excluir","error");

  }finally{

    hideLoading();
  }
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

  elementsCategoria.tituloModal.innerText = "Cadastrar";
  elementsCategoria.modalCategoria.classList.remove('hidden');
  elementsCategoria.tipo.removeAttribute("data-id");
  
  
  limparEdit();
  
  if (!categoriaAtual) return;
  elementsCategoria.tipo.setAttribute("data-id", categoriaAtual.id)
  elementsCategoria.tituloModal.innerText = "Editar";
  elementsCategoria.tipo.value = categoriaAtual.categorias;  

}

elementsCategoria.novaCategoria.onclick = () => {

  categoriaAtual = null;

  abrir();

};

elementsCategoria.salvar.onclick = async () => {

  const novo = elementsCategoria.tipo.value;

  const editID = elementsCategoria.tipo.dataset.id;

  if(novo === ""){
    toast("Nao pode ser vazio", "warning");
      
    return
  }

  try{

    showLoading();

    if(editID){

      await categoriaAPI.editar(novo, editID);

      elementsCategoria.modalCategoria.classList.add('hidden');
    
      toast("Editado com sucesso", "success");
      
      categoriaAtual=null;
      
      await carregar();

      return;

    }

    await categoriaAPI.salvar(novo);

    elementsCategoria.modalCategoria.classList.add('hidden');
    
    toast("Salvo com sucesso", "success");
    
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

elementsCategoria.cancelar.onclick = () => {
  elementsCategoria.modalCategoria.classList.add('hidden');
  categoriaAtual = null;
};


function limparEdit(){
  elementsCategoria.tipo.value='';

}

const btn = document.getElementById('btnMenu');
btn.addEventListener('click',abrirMenu);

function abrirMenu() {
  menu.open();
  
}

function init(){
  auth();
  indicator()
  carregar(); 
  menu.createMenu();
}

init();