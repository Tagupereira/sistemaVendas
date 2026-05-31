import { Routes, navegar } from '../routes/routes.js';

const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', () => {

    navegar(
        Routes.produtos
    );

});
