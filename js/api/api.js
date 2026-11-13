const dadosEmpresa = JSON.parse(localStorage.getItem("empresa")) || {};

const KEY_API = dadosEmpresa.key || "";

export const API_URL = KEY_API ? `https://script.google.com/macros/s/${KEY_API}/exec` : "";

// Todas as chamadas ao servidor passam a levar o "crachá" da sessão automaticamente.
const fetchOriginal = window.fetch.bind(window);

window.fetch = async (entrada, opcoes) => {

  const url = typeof entrada === 'string' ? entrada : entrada.url;

  if (!API_URL || !url.startsWith(API_URL)) {
    return fetchOriginal(entrada, opcoes);
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const token = usuario && usuario.token;

  let urlFinal = url;

  if (token && !url.includes('action=login') && !url.includes('token=')) {
    urlFinal += (url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
  }

  const resposta = await fetchOriginal(urlFinal, opcoes);

  // o servidor avisou que a sessão acabou: volta para o login
  resposta.clone().text().then(texto => {

    if (texto.includes('"sessaoInvalida":true')) {

      localStorage.removeItem('usuario');

      window.location.replace('/index.html');

    }

  }).catch(() => { });

  return resposta;

};

export async function get(action, params = {}) {
  try {

    const query = new URLSearchParams({ action, ...params });

    const response = await fetch(`${API_URL}?${query}`);

    if (!response.ok) {

      return {

        success: false,

        online: false,

        error: `HTTP ${response.status}`

      };

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return {

      success: false,

      online: false,

      error: error.message

    };

  }

}