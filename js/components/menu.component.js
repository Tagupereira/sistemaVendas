import { go } from '../routes/routes.js';

export const menu = {
    createMenu(){

        const divMenu = document.getElementById("menu");

        divMenu.innerHTML = `
            <div id="menuOverlay"></div>

            <div id="menuLateral" class="flex justify-between">
                <div class="flex flex-col h-[100%]">
                <div class="flex justify-between items-center">
                    <span class="ml-5 text-2xl font-semibold">
                    Menu de Gestão
                    </span>
                    <span id="fechar" class="w-10 m-5 flex justify-center items-center font-bold material-symbols-outlined"> close </span>
                </div>

                <hr>
            
                <div class="mt-5">

                    <div id="pageProdutos" data-page="produtos" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-blue-500">home</span>
                    <span class="ml-2 text-2xl ">Inicio</span>
                    </div>

                    <div id="pageControle" data-page="estoque" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-blue-500">inventory_2</span>
                    <span class="ml-2 text-2xl ">Estoque</span>
                    </div>

                    <div id="pageVenda" data-page="vendas" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-purple-500">point_of_sale</span>
                    <span class="ml-2 text-2xl ">Minhas vendas</span>
                    </div>

                    <div id="pageSaidas" data-page="saidas" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-red-500">payment_arrow_down</span>
                    <span class="ml-2 text-2xl ">Saidas</span>
                    </div>

                    <div id="pageRelatorios" data-page="analiseVendas" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-green-500">description</span>
                    <span class="ml-2 text-2xl ">Análise de Vendas</span>
                    </div>

                    <div id="pageCategorias" data-page="categorias" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-pink-500">book_3</span>
                    <span class="ml-2 text-2xl ">Categorias</span>
                    </div>
                    
                    <div id="pagePendentes" data-page="pendentes" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-red-500">credit_card_clock</span>
                    <span class="ml-2 text-2xl ">Pendentes</span>
                    </div>

                    <div id="pageConfig" data-page="configuracoes" class="p-4 flex items-center">
                    <span class="material-symbols-outlined text-orange-500">settings</span>
                    <span class="ml-2 text-2xl ">Configurações</span>
                    </div>
                
                </div>

                <!-- <div id="back" class="p-4 flex items-center mt-[auto]"> -->
                <div id="back" class="p-4 flex items-center ">
                    <span class="material-symbols-outlined text-gray-500">exit_to_app</span>
                    <span class="ml-2 text-2xl  ">Sair</span>
                </div>
                </div>
            
                <div class="p-4 pb-0 bg-gray-50 border-t flex justify-center items-center">
                <p class="text-sm text-center text-gray-500">Desenvolvido por <span class="font-bold">Tiago Pereira</span></p>
                </div>
            </div> 
        `

        document.querySelectorAll('[data-page]')
          .forEach(item => {item.addEventListener('click', () => {
                  
                const page = item.dataset.page;
                const menuLateral = document.getElementById('menuLateral');
                menuLateral.classList.remove('aberto');
                go(page);
            
                }
            );
        });

    },

    open(){
        const overlay = document.getElementById('menuOverlay');
   
        overlay.classList.add('aberto');
        const menuLateral = document.getElementById('menuLateral');
        menuLateral.classList.add('aberto');

        const btnFechar = document.getElementById('fechar');

        btnFechar.addEventListener('click', ()=>{
            menu.close()
        });

    },

    close(){
        const menuLateral = document.getElementById('menuLateral');
        menuLateral.classList.remove('aberto');
        const overlay = document.getElementById('menuOverlay');
        overlay.classList.remove('aberto');
       
    }

}
