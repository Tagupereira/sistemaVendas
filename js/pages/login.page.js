import { API_URL } from "../api/api.js";
import { go } from '../routes/routes.js';
import { toast } from "../components/toast.component.js";
import { startLoading, stopLoading, showLoading, hideLoading } from '../components/loading.component.js';

//console.log("Aplicação iniciada:", new Date().toLocaleTimeString()); -- futuro registro de log.

const usuario = JSON.parse(localStorage.getItem("usuario"));

if(usuario) {
    go("produtos");
}

const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', async () => {
    
    toast("Aguarde...", "info");

    await login();

});
const btnConfig = document.getElementById('btnConfig');

btnConfig.addEventListener('click',()=>{
    alert("oi")
    
    go("conta");

});
//localStorage.removeItem('usuario');

async function login() {

    try {

        btnLogin.disabled = true;

        showLoading();

        const user = document.getElementById('user').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        const res = await fetch(
            `${API_URL}?action=login&user=${encodeURIComponent(user)}&password=${encodeURIComponent(password)}`
        );

        if (!res.ok) {
            throw new Error("Erro de conexão.");
        }

        const data = await res.json();

        if (!data.success) {

            toast("Acesso inválido", "error");

            return;
        }

        localStorage.setItem("usuario", JSON.stringify(data));

        toast("Liberado", "success");

        go("produtos");

    } catch (e) {

        console.error(e);

        toast("Erro ao conectar com o servidor.", "error");

    } finally {

        btnLogin.disabled = false;

        hideLoading();

    }

}

if('serviceWorker' in navigator){

    window.addEventListener('load', async()=>{
        const reg = await navigator.serviceWorker.register('./sw.js');
        
        reg.addEventListener('updatefound',()=>{
            
            const worker = reg.installing;
            worker.addEventListener('statechange',()=>{
                
                if(worker.state === 'installed' && navigator.serviceWorker.controller){
                   const atualizar = confirm("Nova versão disponível. Atualizar?");

                    if(atualizar){
                        window.location.reload();
                    }
                }
            })
        })
        
    });

}