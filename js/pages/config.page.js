import { toast } from "../components/toast.component.js"
import { go, goto } from "../routes/routes.js";
import { API_URL } from "../api/api.js";
import { indicator } from "../services/indicator.service.js";
import { auth } from '../guards/auth.guard.js';
import { temas } from "../config/thema.js";
auth();

const thema = JSON.parse(localStorage.getItem("tema"));


document.getElementById("temaTopo").setAttribute("fill", thema.hex);

document.getElementById("back").addEventListener("click",()=>{
  go("produtos");
})

const toggle = document.getElementById('modoEvento');

toggle.checked = JSON.parse(localStorage.getItem('modoEvento')) || false;

toggle.addEventListener('change', () => {localStorage.setItem('modoEvento', toggle.checked);

    toast(toggle.checked ?'Modo evento ativado':'Modo evento desativado', 'success');

});

document.querySelectorAll(".theme").forEach(btn => {

    btn.onclick = () => {

        const cor = btn.dataset.color;

        localStorage.setItem("tema", JSON.stringify(temas[cor]));

        document.getElementById("temaTopo").setAttribute("fill", temas[cor].hex);

    };

});

function init(){
    indicator();
}

setInterval(() => {

    indicator();    

}, 10000);

init();