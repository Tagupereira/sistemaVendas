import { get } from './api.js';

export const ProdutoAPI = {

  async listar() {

    return await get(
      'listarProdutos'
    );

  }

};