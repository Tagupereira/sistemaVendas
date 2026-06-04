import { API_URL } from '../api/api.js';

export const paymentAPI = {

    async listarTipos() {

        const response =
            await fetch(
                `${API_URL}?action=listarTiposPagamento`
            );
            console.log(response);
            
        return await response.json();

    }

}