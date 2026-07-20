import { go } from "../routes/routes.js";

export function auth(){

const usuario = localStorage.getItem('usuario');

    if(!usuario){

        go('login');

        return;

    }

}