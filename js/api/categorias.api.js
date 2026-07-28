import { API_URL } from './api.js';

export const categoriaAPI = {

    async listarCategorias() {

        const response =
            await fetch(`${API_URL}?action=listarCategorias`);
                        
        return await response.json();

    }

}