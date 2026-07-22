import { reqCount } from "../api/requestDados.api.js";
import { go } from '../routes/routes.js';
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';
import { toast } from "../components/toast.component.js";

const buscarDados = document.getElementById("buscarDados");
const campoEmpresa = document.getElementById("campoEmpresa");
const gravarDados = document.getElementById("gravarDados");
const pesquisa = document.getElementById("campoPesquisa");

let empresa = null;

document.getElementById("back").addEventListener("click",()=>{
   go("login");
})

buscarDados.addEventListener("click",async ()=>{
    toast("Buscando aguarde...", "warning")

    const id = document.getElementById("pesquisa").value;
        
    const dadoReq = await reqCount('buscarEmpresa', id);

    empresa = dadoReq.empresa;
    
    if(empresa === undefined){
        toast("Nada encontrado", "error");
        return;
    }
    
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
    const buscarDados = document.getElementById("buscarDados");
    const pesquisa = document.getElementById("campoPesquisa");
    gravarDados.addEventListener("click",()=>{        
        gravar(empresa);
        gravarDados.classList.add("hidden");
        buscarDados.classList.add("hidden");
        pesquisa.classList.add("hidden");   

        
        campoEmpresa.innerHTML = `
        <h1 class="m-5 font-bold text-gray-600">Registrado para:</h1>
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
    `;

    })

  });

function gravar(empresa){

    toast("Cadastrando...","warning");

    localStorage.setItem("empresa",JSON.stringify(empresa))
}

function confirmaEmpresa(){
        
    const empresa = JSON.parse(localStorage.getItem("empresa"));

    if(empresa){
        buscarDados.classList.add("hidden");
        pesquisa.classList.add("hidden");
        const nome = empresa.nome.toUpperCase()

        campoEmpresa.innerHTML = `
        <h1 class="m-5 font-bold text-gray-600">Registrado para:</h1>
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
    `;
    
    }else{
        campoEmpresa.innerHTML = `
            <div class="bg-white rounded-3xl shadow p-4 flex flex-column justify-between items-center">
                <div class="w-[100%] h-[100px] flex text-center justify-center items-center text-slate-500">Nenhuma empresa cadastrada.</div>
            </div>
        `;
    }
}
confirmaEmpresa();