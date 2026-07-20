import { API_URL } from './api.js';

export const paymentAPI = {

    async listarTipos() {

        const response =
            await fetch(
                `${API_URL}?action=listarTiposPagamento`
            );
                        
        return await response.json();

    }

}