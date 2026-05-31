const KEY_API = 'AKfycbwYVsN0uFrX2ckTE5tAC8DlPpbS-oHG2lywaev1wPdzkQsuw1iVszycKOgI-we72kWuuQ';

export const API_URL = `https://script.google.com/macros/s/${KEY_API}/exec`;
//const API_URL = `https://script.google.com/macros/s/AKfycbwYVsN0uFrX2ckTE5tAC8DlPpbS-oHG2lywaev1wPdzkQsuw1iVszycKOgI-we72kWuuQ/exec`;


export async function get(action, params = {}) {

  const query =
    new URLSearchParams({
      action,
      ...params
    });

  const response =
    await fetch(`${API_URL}?${query}`);

  return await response.json();

}