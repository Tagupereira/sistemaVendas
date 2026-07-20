import { pingAPI } from "../api/ping.api.js";

export async function indicator(){

    const online = await pingAPI();

    const indResp = document.getElementById("indResp");

    indResp.classList.remove("bg-blue-300");

    if(online){
        indResp.classList.remove("bg-red-400")
        indResp.classList.add("bg-[#0BFF65]");
        //console.log("Status: Conexão estabelecida");
    }else{

        indResp.classList.add("bg-red-400");
        //await pingAPI();
        //console.log("Status: Tentando estabelecer conexão");
        
    }

}