import { pingAPI } from "../api/ping.api.js";

export async function indicator(){

    const online = await pingAPI();

    const indResp = document.getElementById("indResp");

    indResp.classList.remove("bg-blue-300");

    if(online){

        indResp.classList.add("bg-[#0BFF65]");

    }else{

        indResp.classList.add("bg-red-400");

    }

}