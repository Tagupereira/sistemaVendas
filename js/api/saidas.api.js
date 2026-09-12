import { API_URL } from './api.js';

export const saidasAPI = {

    async listarSaidas() {

        const response =
            await fetch(`${API_URL}?action=listarSaidas`);
                        
        return await response.json();

    },

    async salvar(tipo){

        const saida = encodeURIComponent(JSON.stringify(tipo));
              
        const url =`${API_URL}?action=salvarSaida&saida=${saida}`;

        const response = await fetch(url);

        const texto = await response.text();
                    
        return texto;
    },

    async editar(novo, id){
              
        const url =`${API_URL}?action=editarSaida&novo=${novo}&id=${id}`;

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
            
        const url =`${API_URL}?action=excluirSaida&id=${id}&tipo=${tipoUser}`;

        const response = await fetch(url);
        
        const texto = await response.text();
                          
        return texto;

    },


}


        
    

