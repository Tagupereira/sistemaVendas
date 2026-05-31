import { go } from '../routes/routes.js';

const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', () => {

    go('produtos');

});
