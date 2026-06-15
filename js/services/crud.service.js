import { API_URL } from "../api/api.js";
import { toast } from "../components/toast.component.js";
import { go } from "../routes/routes.js";
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';

export async function excluir(id) {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const tipoUser = usuario.tipo
    
    // valida admin
    if (usuario?.tipo !== 'administrador') {

        toast(
            'Apenas administrador pode excluir',
            'warning'
        );

        return;

    }

    const confirmar = confirm('Excluir venda?');

    if (!confirmar) {
        return;

    }
    showLoading();

    document.getElementById("btnExcluirVenda").setAttribute("disabled","disabled")

    const res = await fetch(`${API_URL}?action=excluirVenda&id=${id}&tipo=${tipoUser}`);
    const data = await res.json();
        
    if (data.success) {

        toast(
            'Venda excluida',
            'success'
        );

        go('vendas')
        return;

    }
    
    document.getElementById("btnExcluirVenda").removeAttribute("disabled")
    toast(
        'Erro ao excluir',
        'error'
    );

}