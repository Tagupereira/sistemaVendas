const dadosEmpresa = JSON.parse(localStorage.getItem("empresa"));

const KEY_API = dadosEmpresa.key;

export const API_URL = `https://script.google.com/macros/s/${KEY_API}/exec`;

export async function get(action, params = {}) {
  try {

    const query = new URLSearchParams({ action, ...params});

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