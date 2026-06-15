import { API_URL } from "../api/api.js";
import { toast } from "../components/toast.component.js";
import { go } from "../routes/routes.js";

export async function excluir(id) {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const tipoUser = usuario.tipo
    console.log(id);
    console.log(tipoUser);
    
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
    
    document.getElementById("btnExcluirVenda")
    const res = await fetch(`${API_URL}?action=excluirVenda&id=${id}&tipo=${tipoUser}`);
    const data = await res.json();
    console.log(data);
    console.log(res);
    
    if (data.success) {

        toast(
            'Venda excluida',
            'success'
        );

        go('vendas')
        return;

    }

    console.log(data.message);
    
    toast(
        'Erro ao excluir',
        'error'
    );

}