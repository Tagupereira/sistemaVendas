import { go } from '../routes/routes.js';

const pages = [
    {
        idPage: "pageProdutos",
        dataPage: "produtos",
        page: "Inicio",
        icon: "home",
        color: "text-blue-500"
    },
    {
        idPage: "pageControle",
        dataPage: "estoque",
        page: "Estoque",
        icon: "inventory_2",
        color: "text-blue-500"
    },
    {
        idPage: "pageVenda",
        dataPage: "vendas",
        page: "Minhas Vendas",
        icon: "point_of_sale",
        color: "text-purple-500"
    },
    {
        idPage: "pageSaidas",
        dataPage: "saidas",
        page: "Saidas",
        icon: "payment_arrow_down",
        color: "text-red-500"
    },
    {
        idPage: "pageRelatorios",
        dataPage: "analiseVendas",
        page: "Análise de Vendas",
        icon: "document_search",
        color: "text-green-500"
    },
    {
        idPage: "pageCategorias",
        dataPage: "categorias",
        page: "Categorias",
        icon: "format_list_bulleted",
        color: "text-pink-500"
    },
    {
        idPage: "pagePendente",
        dataPage: "pendentes",
        page: "Pendentes",
        icon: "pending_actions",
        color: "text-red-500"
    },
    {
        idPage: "pageEncomendas",
        dataPage: "encomendas",
        page: "Encomendas",
        icon: "calendar_month",
        color: "text-pink-500"
    },
    {
        idPage: "pageConfig",
        dataPage: "configuracoes",
        page: "Configurações",
        icon: "settings",
        color: "text-orange-500"
    }
];

export const menu = {
    
    createMenu(){
        
        const divMenu = document.getElementById("menu");

        const botoes = pages.map(item => `
            <div id="${item.idPage}" data-page="${item.dataPage}" class="p-2 flex items-center cursor-pointer">
                <span class="material-symbols-outlined ${item.color}">
                    ${item.icon}
                </span>

                <span class="ml-2 text-2xl">
                    ${item.page}
                </span>
            </div>
        `).join("");

        divMenu.innerHTML = `
            <div id="menuOverlay"></div>

            <div id="menuLateral" class="flex justify-between">

                <div class="flex flex-col h-[100%]">

                    <div class="flex justify-between items-center">

                        <span class="ml-5 text-2xl font-semibold">Menu de Gestão</span>

                        <span id="fechar" class="w-10 m-5 flex justify-center items-center font-bold material-symbols-outlined">
                            close
                        </span>

                    </div>

                    <hr>

                    <div id="actionButtons" class="mt-5">
                        ${botoes}
                    </div>

                </div>

                <div class="p-3 pb-0 bg-gray-50 border-t flex justify-center items-center">

                    <p class="text-sm text-center text-gray-500">
                        Desenvolvido por <span class="font-bold">Tiago Pereira</span>
                    </p>

                </div>

            </div>
        `;

        document.querySelectorAll('[data-page]').forEach(item => {

            item.addEventListener('click', () => {

                const page = item.dataset.page;

                document.getElementById('menuLateral').classList.remove('aberto');

                go(page);

            });

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
