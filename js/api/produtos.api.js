import { get, API_URL } from './api.js';

export const ProdutoAPI = {

  async listar() {

    return await get(
      'listarProdutos'
    );

  },

  async salvar(produto){

    const produtoJson = encodeURIComponent(JSON.stringify(produto));

    const response = await fetch(`${API_URL}?action=salvarProduto&produto=${produtoJson}`);

    return await response.json();

  }

};