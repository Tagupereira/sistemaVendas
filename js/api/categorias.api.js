import { API_URL } from './api.js';

export const categoriaAPI = {

    async listarCategorias() {

        const response =
            await fetch(`${API_URL}?action=listarCategorias`);
                        
        return await response.json();

    },

    async salvar(tipo){
       
        const url =`${API_URL}?action=salvarCategoria&categoria=${tipo}`;

        const response = await fetch(url);

        const texto = await response.text();
                    
        return texto;
    },

    async editar(novo, id){
              
        const url =`${API_URL}?action=editarCategoria&novo=${novo}&id=${id}`;

        const response = await fetch(url);
        
        const texto = await response.text();
                          
        return texto;
    },

    async excluir(id){
        
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const tipoUser = usuario.tipo;
        
        // valida admin
        if (usuario?.tipo !== 'administrador') {
            
            toast(
                'Apenas administrador pode excluir',
                'warning'
            );
            
            return;
            
        }
            
        const url =`${API_URL}?action=excluirCategoria&id=${id}&tipo=${tipoUser}`;

        const response = await fetch(url);
        
        const texto = await response.text();
                          
        return texto;

    },


}


        
    

