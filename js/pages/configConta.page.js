import { reqCount } from "../api/requestDados.api.js";
import { go, goto } from '../routes/routes.js';

const buscarDados = document.getElementById("buscarDados");
const campoEmpresa = document.getElementById("campoEmpresa");

let empresa = null;

document.getElementById("back").addEventListener("click",()=>{
   go("login");
})

buscarDados.addEventListener("click",async ()=>{

    const id = document.getElementById("pesquisa").value;
        
    const dadoReq = await reqCount('buscarEmpresa', id);

    empresa = dadoReq.empresa;

    const nome = empresa.nome.toUpperCase()

    campoEmpresa.innerHTML = `
      <div class="bg-white rounded-3xl shadow p-4 flex flex-column justify-between items-center">
        <div class="">

            <p class="text-xs text-gray-500 ">
                ID: ${empresa.id}
            </p>

            <h3 class="font-bold text-base text-gray-800 truncate">
                ${nome}
            </h3>

            <p class="text-base text-gray-800 mt-0.5 truncate">
                Licenca: ${empresa.licenca}
            </p>

            <span class="text-base text-gray-800 mt-0.5 truncate">
                Status: ${empresa.status}
            </span>

        </div>
      </div>
      <button id="gravarDados" class="w-full bg-blue-500 text-white rounded-xl p-3 mt-5 mb-5">

            Gravar Dados

        </button>
    `;

    const gravarDados = document.getElementById("gravarDados");

    gravarDados.addEventListener("click",()=>{        
        gravar(empresa);
    })

  });

function gravar(empresa){
      
    localStorage.setItem("empresa",JSON.stringify(empresa))
}
