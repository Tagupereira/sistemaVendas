import { toast } from "../components/toast.component.js"
import { go, goto } from "../routes/routes.js";
import { API_URL } from "../api/api.js";
import { indicator } from "../services/indicator.service.js";
import { auth } from '../guards/auth.guard.js';
import { temas } from "../config/thema.js";
import { menu } from "../components/menu.component.js";

const thema = JSON.parse(localStorage.getItem("tema"));
document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('btnMenu').classList.add(`${thema.text}`)
document.getElementById('tituloPage').classList.add(`${thema.text}`)

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
        document.getElementById("tituloPage").setAttribute("class", `text-2xl font-semibold ${temas[cor].text}`);
        document.getElementById("btnMenu").setAttribute("class", `material-symbols-outlined text-3xl ${temas[cor].text}`);
        
    };

});

const btn = document.getElementById('btnMenu');
btn.addEventListener('click',abrirMenu);

function abrirMenu() {
  menu.open();
  
}

function init(){
    auth();
    indicator();
    menu.createMenu();
}

setInterval(() => {

    indicator();    

}, 10000);

init();