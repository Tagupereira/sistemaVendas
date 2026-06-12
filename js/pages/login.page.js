import { API_URL } from "../api/api.js";
import { go } from '../routes/routes.js';
import { conectar } from "../services/printer.service.js";
import { toast } from "../components/toast.component.js";
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';

const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', async () => {
    //await conectar();
    toast("Aguarde...", "info")

   await login()

});
localStorage.removeItem('usuario');

async function login() {

    const user = document.getElementById('user').value;

    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&password=${encodeURIComponent(password)}`);

    const data = await res.json();
    
    console.log(res);
    console.log( data);
    
    
    if (
        !data.success
    ) {

        toast(
            'Acesso invalido',
            'error'
        );
        document.getElementById('user').value = "";
        document.getElementById('password').value = "";

        return;
    }

    toast("Liberado", "success");

    localStorage.setItem('usuario', JSON.stringify(data));

    go('produtos');

}