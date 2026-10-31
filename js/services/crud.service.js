import { API_URL } from "../api/api.js";
import { toast } from "../components/toast.component.js";
import { go } from "../routes/routes.js";
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';
import { confirmar } from "../components/confirm.component.js";
//import { carregarPagina } from "../pages/index.page.js";

export async function excluir(id, venda = {}) {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const tipoUser = usuario.tipo
    
    console.log(id);
    // valida admin
    if (usuario?.tipo !== 'administrador') {

        toast(
            'Apenas administrador pode excluir',
            'warning'
        );

        return;
    }

    const numero = venda.pedido ? `Pedido #${String(venda.pedido).padStart(4, '0')}` : 'Esta venda';

    const confirmou = await confirmar({
        titulo: 'Excluir venda?',
        mensagem: venda.cliente ? `${numero} — ${venda.cliente}` : numero,
        detalhe: 'A venda e os pagamentos dela serão apagados. Essa ação não pode ser desfeita.',
        textoConfirmar: 'Excluir',
        perigo: true
    });

    if (!confirmou) return;
    
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

//////////////////////////////////////////////////////////////////////////

export async function excluirItem(id) {

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

    showLoading();

    const res = await fetch(`${API_URL}?action=excluirItem&id=${id}&tipo=${tipoUser}`);
    const data = await res.json();
        
    if (data.success) {

        toast(
            'Item excluido',
            'success'
        );

        return;

    }
    
    toast(
        'Erro ao excluir',
        'error'
    );

}