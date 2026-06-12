import { go } from '../routes/routes.js';
import { conectar } from "../services/printer.service.js";

const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', async () => {
    //await conectar();
    go('produtos');

});
