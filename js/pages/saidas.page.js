import { saidasAPI } from "../api/saidas.api.js";
import { indicator } from "../services/indicator.service.js";
import { toast } from "../components/toast.component.js";
import { auth } from '../guards/auth.guard.js';
//import { excluir } from "../services/crud.service.js";
import { showLoading, hideLoading } from '../components/loading.component.js';
import { elementsSaida } from "../elements/elementos.js";
import { menu } from "../components/menu.component.js";

const thema = JSON.parse(localStorage.getItem("tema"));
document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('novaSaida').classList.add(`${thema.tailwind}`,`${thema.text}`);
const lista = document.getElementById('listaSaidas');

document.getElementById('btnMenu').classList.add(`${thema.text}`)
document.getElementById('tituloPage').classList.add(`${thema.text}`)

const novaSaida = document.getElementById('novaSaida');
const modalSaida = document.getElementById('modalSaida');

const usuario = JSON.parse(localStorage.getItem('usuario'));
const tipoPagamentos = JSON.parse(localStorage.getItem("payments"));
const select = document.getElementById("tipoSaida");

let saidasList = [
  {
    id: "1",
    nomeSaida: "Compra de ingredientes",
    valorSaida: 150.00,
    tipoSaida: "Dinheiro",
    dataSaida: "2026-09-07"
  },
  {
    id: "2",
    nomeSaida: "Compra de embalagens",
    valorSaida: 85.50,
    tipoSaida: "Pix",
    dataSaida: "2026-09-05"
  },
  {
    id: "3",
    nomeSaida: "Conta de energia",
    valorSaida: 230.00,
    tipoSaida: "Pix",
    dataSaida: "2026-09-05"
  },
  {
    id: "4",
    nomeSaida: "Material de limpeza",
    valorSaida: 62.90,
    tipoSaida: "Dinheiro",
    dataSaida: "2026-09-05"
  },
  {
    id: "1",
    nomeSaida: "Compra de ingredientes",
    valorSaida: 150.00,
    tipoSaida: "Dinheiro",
    dataSaida: "2026-09-07"
  },
  {
    id: "2",
    nomeSaida: "Compra de embalagens",
    valorSaida: 85.50,
    tipoSaida: "Pix",
    dataSaida: "2026-09-05"
  },
  {
    id: "3",
    nomeSaida: "Conta de energia",
    valorSaida: 230.00,
    tipoSaida: "Pix",
    dataSaida: "2026-09-05"
  },
  {
    id: "4",
    nomeSaida: "Material de limpeza",
    valorSaida: 62.90,
    tipoSaida: "Dinheiro",
    dataSaida: "2026-09-05"
  },
  {
    id: "1",
    nomeSaida: "Compra de ingredientes",
    valorSaida: 150.00,
    tipoSaida: "Dinheiro",
    dataSaida: "2026-09-07"
  },
  {
    id: "2",
    nomeSaida: "Compra de embalagens",
    valorSaida: 85.50,
    tipoSaida: "Pix",
    dataSaida: "2026-09-05"
  },
  {
    id: "3",
    nomeSaida: "Conta de energia",
    valorSaida: 230.00,
    tipoSaida: "Pix",
    dataSaida: "2026-09-05"
  },
  {
    id: "4",
    nomeSaida: "Material de limpeza",
    valorSaida: 62.90,
    tipoSaida: "Dinheiro",
    dataSaida: "2026-09-05"
  }
];
let saidaAtual = null;


async function carregar() {

  const response = await saidasAPI.listarSaidas();
 
  const saidas = response.lista;
  
  render(saidas);

}

function render(saidas) {

  if (saidas.length === 0) {
    lista.innerHTML = `
      <div class="text-center text-slate-400 py-10">
        Nenhuma saída encontrada.
      </div>
    `;
    return;
  }

  saidas.sort((b, a) => {
    return new Date(a.dataSaida) - new Date(b.dataSaida);
  });

  // Agrupa as saídas por data
  const grupos = {};

  saidas.forEach(saida => {

    const data = saida.dataSaida.split("T")[0];

    if (!grupos[data]) {
      grupos[data] = [];
    }

    grupos[data].push(saida);
  });

  lista.innerHTML = "";

  Object.entries(grupos).forEach(([data, saidasDoDia]) => {

    const dataObj = new Date(`${data}T00:00:00`);

    const dia = dataObj.toLocaleDateString("pt-BR", {
      day: "2-digit"
    });

    const semana = dataObj.toLocaleDateString("pt-BR", {
      weekday: "short"
    }).replace(".", "");

    const mes = dataObj.toLocaleDateString("pt-BR", {
      month: "short"
    }).replace(".", "");

    const ano = dataObj.toLocaleDateString("pt-BR", {
      year: "2-digit"
    }).replace(".", "");

    lista.innerHTML += `

      <div class="flex gap-4 mb-5">

        <!-- DATA -->
        <div class="w-10 shrink-0 text-center pt-3">
          <div class="text-sm text-slate-400 uppercase">
            ${semana}
          </div>

          <div class="text-2xl font-bold text-slate-600">
            ${dia}
          </div>

          <div class="text-sm text-slate-400 uppercase">
            ${mes}
          </div>

          <div class="text-sm text-slate-400 uppercase">
            ${ano}
          </div>

        </div>


        <!-- LINHA + SAÍDAS -->
        <div class="relative flex-1 pl-6 pb-6">

          <!-- linha vertical -->
          <div class="absolute left-0 top-3 bottom-0 w-px bg-slate-200"></div>


          ${saidasDoDia.map(saida => `

            <div class="relative mb-3">

              <!-- bolinha -->
              <div class="absolute -left-[30px] top-5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>


              <!-- saída -->
              <div class="bg-white rounded-2xl shadow p-3">

                <div id="${saida.id}" class="flex justify-between">

                  <div class="w-[100%]">

                    <div class="font-medium truncate">
                      ${saida.nomeSaida}
                    </div>

                    <div class="flex justify-between">
                      <div class="text-sm text-slate-400">
                        ${saida.tipoSaida}
                      </div>
                      <div class="font-bold text-red-500 whitespace-nowrap">
                        - R$ ${Number(saida.valorSaida).toFixed(2).replace(".", ",")}
                      </div>

                      
                    </div>

                  </div>

                </div>

              </div>

            </div>

          `).join("")}

        </div>

      </div>

    `;
  });
}

//-------------- ABRE MODAL -------------//
novaSaida.addEventListener("click", () => {

  modalSaida.classList.remove('hidden');

  select.innerHTML = '<option class="text-slate-500" value="">Tipo Saida</option>';

    tipoPagamentos.payments.forEach(p => {
        if(p.tipo_pagamento === "pendente"){
          return;
        }
        select.innerHTML += `<option data-id="${p.id}" value="${p.tipo_pagamento}">${p.tipo_pagamento}</option>`       
    })
})

const btnCancelarModal = document.getElementById("cancelarModal")

  btnCancelarModal.addEventListener("click",()=>{
    modalSaida.classList.add('hidden');
    limparEdit();
  })
  
  elementsSaida.btnCadastraSaida.addEventListener("click", async ()=>{
    
    const novaSaida = {
      nomeSaida: elementsSaida.nomeSaida.value,
      valorSaida: elementsSaida.valorSaida.value,
      tipoSaida: elementsSaida.tipoSaida.value,
      dataSaida: elementsSaida.dataSaida.value
    };
    
    saidasAPI.salvar(novaSaida);

    modalSaida.classList.add('hidden');
    limparEdit();
    toast("Saida cadastrada com sucesso", "success")
      
    await carregar();

  })
//-----------------FIM MODAL---------------//

window.editar = (id) => {
    
  categoriaAtual = categoriaList.find(p => p.id == id);

  abrir();

};

window.excluir = async (id) => {
    
  saidaAtual = saidaList.find(p => p.id == id);
  //console.log(saidaAtual);
  
  const confirma = confirm(`Deseja excluir ${saidaAtual.nomeSaida}?`);
  
  if (!confirma) return;
  
    showLoading();
    
  try{
    
    await saidasAPI.excluir(id);
  
    toast("Item excluído","success");
    await carregar();   

  }catch{

      toast("Erro ao excluir","error");

  }finally{

    hideLoading();
  }
};

function abrir() {

  elements.tituloModal.innerText = "Cadastrar";
  elements.modalCategoria.classList.remove('hidden');
  elements.tipo.removeAttribute("data-id");
  
  
  limparEdit();
  
  if (!categoriaAtual) return;
  elements.tipo.setAttribute("data-id", categoriaAtual.id)
  elements.tituloModal.innerText = "Editar";
  elements.tipo.value = categoriaAtual.categorias;  

}

// elements.novaCategoria.onclick = () => {

//   categoriaAtual = null;

//   abrir();

// };

// elements.salvar.onclick = async () => {

//   const novo = elements.tipo.value;

//   const editID = elements.tipo.dataset.id;

//   if(novo === ""){
//     toast("Nao pode ser vazio", "warning");
      
//     return
//   }

//   try{

//     showLoading();

//     if(editID){

//       await categoriaAPI.editar(novo, editID);

//       elements.modalCategoria.classList.add('hidden');
    
//       toast("Editado com sucesso", "success");
      
//       categoriaAtual=null;
      
//       await carregar();

//       return;

//     }

//     await categoriaAPI.salvar(novo);

//     elements.modalCategoria.classList.add('hidden');
    
//     toast("Salvo com sucesso", "success");
    
//     categoriaAtual=null;
    
//     await carregar();
    
//   }
//   catch{
//     toast("Erro ao salvar", "error");

//   }
//   finally{
//     hideLoading();
//   }
// };

// elements.cancelar.onclick = () => {
//   elements.modalCategoria.classList.add('hidden');
//   categoriaAtual = null;
// };

const btn = document.getElementById('btnMenu');
btn.addEventListener('click',abrirMenu);

function abrirMenu() {
  menu.open();
  
}

function limparEdit(){

  elementsSaida.nomeSaida.value='';
  elementsSaida.valorSaida.value='';
  elementsSaida.tipoSaida.value='';
  elementsSaida.dataSaida.value='';

}

function init(){
  auth();
  indicator();
  menu.createMenu();
  carregar(); 
}

init();