import { API_URL } from "./api.js";

export const vendasAPI = {

    // async salvar(venda){

    //     const vendaJson = encodeURIComponent(JSON.stringify(venda));

    //     const response = await fetch(
    //             `${API_URL}?action=salvarVenda&venda=${vendaJson}`
    //         );

    //     return await response.json();

    // }
    async salvar(venda){

    const vendaJson =
        encodeURIComponent(
            JSON.stringify(venda)
        );

    const url =
        `${API_URL}?action=salvarVenda&venda=${vendaJson}`;

    console.log(url);

    const response =
        await fetch(url);

    console.log(response);

    const texto =
        await response.text();

    console.log(texto);

    return JSON.parse(texto);

}
}

// export const vendasAPI = {

//     async salvar(venda){

//         const response =
//             await fetch(
//                 API_URL,
//                 {
//                     method: 'POST',

//                     headers: {
//                         'Content-Type':
//                         'application/json'
//                     },

//                     body: JSON.stringify({

//                         action: 'salvarVenda',

//                         venda

//                     })

//                 }
//             );

//         return await response.json();

//     }

// }