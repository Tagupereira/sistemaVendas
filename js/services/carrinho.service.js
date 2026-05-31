let carrinho = [];
let carrinhoAberto = false;

export function getCarrinho() {
    return carrinho;
}

export function adicionarCarrinho(produto) {

    const item = carrinho.find(
        p => p.id == produto.id
    );

    if(item){

        item.quantidade++;

    } else {

        carrinho.push({
            ...produto,
            quantidade: 1
        });

    }

    salvarCarrinho();

    if(carrinho.length === 1){

        carrinhoAberto = true;

        document
            .getElementById('conteudoCarrinho')
            .classList.remove('hidden');

    }

    atualizarCarrinhoUI();

}

export function salvarCarrinho() {

    localStorage.setItem(
        'carrinho',
        JSON.stringify(carrinho)
    );

}

export function carregarCarrinho() {

    carrinho =
        JSON.parse(
            localStorage.getItem('carrinho')
        ) || [];

}

export function atualizarCarrinhoUI() {

    const carrinhoDiv = document.getElementById('carrinho');

    const lista = document.getElementById('listaCarrinho');

    const total = document.getElementById('totalCarrinho');

    const carrinho = getCarrinho();

    if(carrinho.length === 0){

        document.getElementById('resumoCarrinho').textContent = '🛒 Carrinho vazio';

        document.getElementById('totalMiniCarrinho').textContent = 'R$ 0,00';

        lista.innerHTML = '';

        return;

    }

    carrinhoDiv.classList.remove('hidden');

    lista.innerHTML = '';

    let valorTotal = 0;
    let quantidadeItens = 0;

    carrinho.forEach(item => {

        valorTotal +=
            item.preco * item.quantidade;

        quantidadeItens +=
            item.quantidade;

        lista.innerHTML += `
            <div class="flex justify-between items-center py-3 border-b">

            <div>

                <h3 class="font-semibold">
                    ${item.nome}
                </h3>

                <span>
                    R$ ${item.preco.toFixed(2)}
                </span>

            </div>

            <div class="flex items-center gap-3">

                <button
                    class="menos w-8 h-8 rounded-full bg-red-500 text-white"
                    data-id="${item.id}">

                    -

                </button>

                <span>
                    ${item.quantidade}
                </span>

                <button
                    class="mais w-8 h-8 rounded-full bg-green-500 text-white"
                    data-id="${item.id}">

                    +

                </button>

            </div>

        </div>`;        
        
    });

    document.getElementById('resumoCarrinho').textContent =`${quantidadeItens} itens`;

    document.getElementById('totalMiniCarrinho').textContent = valorTotal.toLocaleString('pt-BR', {
        style:'currency',
        currency:'BRL'
        }
    );

    
    total.textContent = valorTotal.toLocaleString('pt-BR', {
            style:'currency',
            currency:'BRL'
        }
    );  

}


export function aumentarQuantidade(id){

    const item = carrinho.find(
        p => p.id === id
    );

    if(item){

        item.quantidade++;

    }

    atualizarCarrinhoUI();

}

export function diminuirQuantidade(id){

    const item = carrinho.find(
        p => p.id === id
    );

    if(!item) return;

    item.quantidade--;

    if(item.quantidade <= 0){

        carrinho = carrinho.filter(
            p => p.id !== id
        );
        
    }
    salvarCarrinho();
    atualizarCarrinhoUI();


}

export function abrirCarrinho(){
    document.getElementById('carrinho').classList.remove('hidden');
}

export function fecharCarrinho(){
    document.getElementById('carrinho').classList.add('hidden');
}

export function iniciarCarrinho() {

    document
        .getElementById('toggleCarrinho')
        .addEventListener('click', () => {

            carrinhoAberto = !carrinhoAberto;

            document
                .getElementById('conteudoCarrinho')
                .classList.toggle(
                    'hidden',
                    !carrinhoAberto
                );

            document
                .getElementById('iconeCarrinho')
                .textContent =
                carrinhoAberto
                    ? '▼'
                    : '▲';

        });

    document
        .getElementById('listaCarrinho')
        .addEventListener('click', (e) => {

            if(
                e.target.classList.contains('mais')
            ){

                aumentarQuantidade(
                    Number(
                        e.target.dataset.id
                    )
                );

            }

            if(
                e.target.classList.contains('menos')
            ){

                diminuirQuantidade(
                    Number(
                        e.target.dataset.id
                    )
                );

            }

        });

}
