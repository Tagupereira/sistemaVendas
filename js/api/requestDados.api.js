const KEY_API = 'AKfycbwYVsN0uFrX2ckTE5tAC8DlPpbS-oHG2lywaev1wPdzkQsuw1iVszycKOgI-we72kWuuQ';

const API_URL = `https://script.google.com/macros/s/${KEY_API}/exec`;

export async function reqCount(action,id){  

  try {

    const response = await fetch(`${API_URL}?action=${action}&id=${id}`);
      
    const data = await response.json();
        
    return data;

  } catch(e) {

    console.error(e);

    return {
        success:false
    };
  }
}