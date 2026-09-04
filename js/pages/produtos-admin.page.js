import { indicator } from "../services/indicator.service.js";
import { go } from '../routes/routes.js';
import { toast } from "../components/toast.component.js";
import { auth } from '../guards/auth.guard.js';
import { excluirItem } from "../services/crud.service.js";
import { ProdutoAPI } from '../api/produtos.api.js';
import { showLoading, hideLoading } from '../components/loading.component.js';
import { menu } from "../components/menu.component.js";

const thema = JSON.parse(localStorage.getItem("tema"));
document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('novoProduto').classList.add(`${thema.tailwind}`);
document.getElementById('btnMenu').classList.add(`${thema.text}`)
document.getElementById('novoProduto').classList.add(`${thema.text}`)
document.getElementById('tituloPage').classList.add(`${thema.text}`)

const usuario = JSON.parse(localStorage.getItem('usuario'));

let produtos = [];

let produtoAtual = null;

async function carregar() {

  const response = await ProdutoAPI.listar();

  produtos = response.produtos;

  render(produtos);

}

function render(produtos) {
  
  const lista = document.getElementById('listaProdutos');

  if (produtos.length === 0) {
    lista.innerHTML = '<div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500 ">Nenhum item encontrado</div>';
    return
  }

  lista.innerHTML = '';

  produtos.forEach(p => {

    lista.innerHTML += `
   

      <div class=" column bg-white rounded-3xl p-5 shadow ${p.status==='ativo'?'border-green-500':'opacity-50'}">
        <div class="flex justify-between">
          <div class="flex flex-col">
            <b>${p.nome.toUpperCase()}</b>
            
          </div>

          <div class="flex truncate w-24"><span class="w-full text-right">R$ ${p.preco.toFixed(2).replace('.', ',')}</span></div>

        </div>

        <div class="flex justify-between gap-2 mt-3">

          <div class="flex items-center gap-3">
          
            <span class="text-sm text-slate-500">
            ${p.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
            
            <label class="relative inline-flex items-center cursor-pointer">
            
            <input type="checkbox" class="sr-only peer"${p.status==='ativo' ? 'checked' : ''} onchange="alterarStatus(${p.id})">
            
            <div class="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-green-500 
            after:content-[''] after:absolute after:left-1 after:top-1 after:w-6 after:h-6 after:bg-white
            after:rounded-full after:transition-all peer-checked:after:translate-x-6">
            </div> 
            
            </label>
          
          </div>
          <div>
            <button onclick="editar('${p.id}')" class="bg-orange-500 text-white p-2 rounded text-center">
              Editar
            </button>

            <button onclick="confirmarExclusao('${p.id}')" class="bg-red-500 text-white p-2 rounded text-center">
              Excluir
            </button>
          </div>

        </div>

      </div>
    `;
  });

}

window.confirmarExclusao = async(id)=>{
 
    const produto = produtos.find(p=>p.id==id);

    if(!produto) return;


    const confirma = confirm(
        `Deseja excluir "${produto.nome}"?`
    );

    if (!confirma) return;

    showLoading();
    try{
      
      await excluirItem(id);
      
      toast("Item excluído","success");
      await carregar();   


    }catch{

        toast("Erro ao excluir","error");

    }finally{

      hideLoading();
    }

}

window.alterarStatus = async(id)=>{

  let produto = null;

  try{

    produto = produtos.find(p=>p.id==id);

    if(!produto){
      toast('Produto não encontrado','warning');
      return;
    }

    produto.status = produto.status === 'ativo'?'inativo':'ativo';

    const response = await ProdutoAPI.salvar(produto);
        
    if(!response.success){
      throw new Error('Falha ao salvar');
    }

    toast(`${produto.nome.toUpperCase()} - Status: ${produto.status}`,'info');

    render(produtos);

  }
  catch(error){

    console.error(error);

    toast('Erro ao alterar status','error');

    if(produto){
      produto.status = produto.status === 'ativo'?'inativo':'ativo';
    }

  }

};

window.editar = (id) => {
  produtoAtual = produtos.find(p => p.id == id);
  abrir();

};

window.status = async (id) => {
    const produto = produtos.find(p => p.id == id);

    produto.status = produto.status === 'ativo'?'inativo':'ativo';

    await ProdutoAPI.salvar(
      produto
    );

    carregar();

};

function abrir() {

  document.getElementById('modalProduto').classList.remove('hidden');
  
  limparEdit();
  
  if (!produtoAtual) return;

  nome.value = produtoAtual.nome;

  descricao.value = produtoAtual.descricao;

  preco.value = produtoAtual.preco;

  tipoVenda.value = produtoAtual.tipo_de_venda;

}

novoProduto.onclick = () => {

  produtoAtual = null;

  abrir();

};

salvar.onclick = async () => {

  const novo = {

    id: produtoAtual?.id ?? Math.max(...produtos.map(p => Number(p.id))) + 1,
    
    nome: nome.value,

    descricao: descricao.value,

    preco: parseFloat(preco.value.replace(/\./g, "").replace(",", ".")),

    tipo_de_venda: tipoVenda.value,

    status: produtoAtual?.status || 'ativo'

  };

  try{

    showLoading();

    const response = await ProdutoAPI.salvar(novo);
    console.log(response);
    

    modalProduto.classList.add('hidden');
    
    toast("Salvo com sucesso", "success");

    limparEdit();

    produtoAtual=null;

    await carregar();

  }
  catch(error){
    console.log(error);
    
    toast("Erro ao salvar", "error");

  }
  finally{
    hideLoading();
  }
};

cancelar.onclick = () => {
  modalProduto.classList.add('hidden');
  produtoAtual = null;
};

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
      normalizar(produto.tipo_de_venda).includes(termo) ||
      normalizar(produto.status).includes(termo)
    );
    
  });
   render(filtrados);
  
});

function limparEdit(){

  document.getElementById('nome').value='';

  document.getElementById('descricao').value='';

  document.getElementById('preco').value='';

  document.getElementById('tipoVenda').value='unidade';

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