import { toast } from "../components/toast.component.js"

const toggle = document.getElementById('modoEvento');

toggle.checked = JSON.parse(localStorage.getItem('modoEvento')) || false;

toggle.addEventListener('change', () => {localStorage.setItem('modoEvento', toggle.checked);

    toast(toggle.checked ?'Modo evento ativado':'Modo evento desativado', 'success');

});