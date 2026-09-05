import { toast } from "../components/toast.component.js";
import { showLoading, hideLoading } from '../components/loading.component.js';

export const Routes = {

    login: '/index.html',

    produtos: '/produtos.html',

    estoque: '/estoque.html',

    pagamentos: '/payments.html',

    analiseVendas: '/analiseVendas.html',

    saidas: '/saidas.html',

    pendentes: '/pendentes.html',

    concluido: '/concluido.html',
    
    vendas: '/vendas.html',

    categorias: '/categorias.html',

    configuracoes: '/configuracoes.html',

    conta: '/configConta.html'

};

export const go = (page) => {
        
    if(!Routes[page]){
        const overlay = document.getElementById("menuOverlay");
        toast("Pagina em desenvolvimento", "warning");
        overlay.classList.remove("aberto")
        return;
    }
    window.location.replace(Routes[page]);
}

export function back(){

    window.history.back();

}

export function goto(n){
    history.go(n)
}