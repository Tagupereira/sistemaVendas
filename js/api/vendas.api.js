import { API_URL } from "./api.js";

export const vendasAPI = {

    async salvar(venda){
       
        const vendaJson =
            encodeURIComponent(
                JSON.stringify(venda)
            );

        const url =
            `${API_URL}?action=salvarVenda&venda=${vendaJson}`;

        const response =
            await fetch(url);

        const texto =
            await response.text();
            
        return JSON.parse(texto);

    },

    async listar(){

        const response =
            await fetch(
                `${API_URL}?action=listarVendas`
            );

        return await response.json();

    }
    
}

