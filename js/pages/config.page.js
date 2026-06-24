import { toast } from "../components/toast.component.js"
import { go, goto } from "../routes/routes.js";
import { API_URL } from "../api/api.js";
import { indicator } from "../services/indicator.service.js";
import { auth } from '../guards/auth.guard.js';
auth();

document.getElementById("back").addEventListener("click",()=>{
  go("produtos");
})

const toggle = document.getElementById('modoEvento');

toggle.checked = JSON.parse(localStorage.getItem('modoEvento')) || false;

toggle.addEventListener('change', () => {localStorage.setItem('modoEvento', toggle.checked);

    toast(toggle.checked ?'Modo evento ativado':'Modo evento desativado', 'success');

});

function init(){
    indicator();
}

setInterval(() => {

    indicator();    

}, 10000);

init();