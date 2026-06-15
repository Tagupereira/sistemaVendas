let carrinho = [];
let carrinhoAberto = false;

const btnFinalizar = document.getElementById('finalizarPedido');
const icone = document.getElementById('iconeCarrinho');

export function getCarrinho() {
    return carrinho;
}

export function adicionarCarrinho(produto) {

    const item = carrinho.find(
        p => p.id == produto.id && (p.observacao || '') === (produto.observacao || '')
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

    atualizarCarrinhoUI();
   
}

export function salvarCarrinho() {

    localStorage.setItem(
        'carrinho',
        JSON.stringify(carrinho)
    );

    localStorage.setItem(
        'resumoPedido',
        JSON.stringify(
            getResumoPedido()
        )
    );

}

export function carregarCarrinho() {

    carrinho =
        JSON.parse(
            localStorage.getItem('carrinho')
        ) || [];

}

export function atualizarCarrinhoUI() {

    const lista = document.getElementById('listaCarrinho');

    const carrinho = getCarrinho();
    
    
    if(carrinho.length === 0){

        carrinhoAberto = false;
        atualizarEstadoCarrinho();
        
        // document.getElementById('iconeCarrinho').textContent = carrinhoAberto ? '▼' : '▲';
        icone.classList.toggle('rotate-180', carrinhoAberto);

        document.getElementById('resumoCarrinho').textContent = '🛒 Carrinho vazio';

        document.getElementById('totalMiniCarrinho').textContent = 'R$ 0,00';

        document.getElementById('totalCarrinho').textContent = 'R$ 0,00';

        btnFinalizar.classList.add(
            'opacity-50',
            'pointer-events-none',
            'cursor-not-allowed'
        );

        lista.innerHTML = '';
        
        acaoBtn(1)
       
        return;

    }

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
                    data-id="${item.idCarrinho}">

                    -

                </button>

                <span>
                    ${item.quantidade}
                </span>

                <button
                    class="mais w-8 h-8 rounded-full bg-green-500 text-white"
                    data-id="${item.idCarrinho}">

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

    document.getElementById('totalCarrinho').textContent = valorTotal.toLocaleString('pt-BR', {
            style:'currency',
            currency:'BRL'
        }
    );  

    acaoBtn();

}

export function aumentarQuantidade(id){
    
    console.log("id",id);
    
    const item = carrinho.find(
        p => p.idCarrinho === id
    );
        
    console.log("item: ",item);
    
    if(item){

       item.quantidade++;

    }
    salvarCarrinho();
    atualizarCarrinhoUI();

}

export function diminuirQuantidade(id){

    const item = carrinho.find(
        p => p.idCarrinho === id
    );

    if(!item) return;

    item.quantidade--;

    if(item.quantidade <= 0){

        carrinho = carrinho.filter(
            p => p.idCarrinho !== id
        );
        
    }
    salvarCarrinho();
    atualizarCarrinhoUI();

}

export function iniciarCarrinho() {
    document.getElementById('toggleCarrinho').addEventListener('click', () => {

        if(carrinho.length === 0){
            return;
        }

        carrinhoAberto = !carrinhoAberto;

        // document.getElementById('iconeCarrinho').textContent = carrinhoAberto ? '▼' : '▲';
        
        icone.classList.toggle('rotate-180', carrinhoAberto);

        atualizarEstadoCarrinho();

    });

    

    document.getElementById('listaCarrinho').addEventListener('click', (e) => {

        if(e.target.classList.contains('mais')){

            aumentarQuantidade(e.target.dataset.id);
        }

        if(e.target.classList.contains('menos')){

            diminuirQuantidade(e.target.dataset.id);
        }

    });
}

function acaoBtn(btn){

    if(btn){
        btnFinalizar.classList.add(
            'opacity-50',
            'pointer-events-none',
            'cursor-not-allowed'
        );
        return
    }

    btnFinalizar.classList.remove(
        'opacity-50',
        'pointer-events-none',
        'cursor-not-allowed'
    );
    
}

export function getResumoPedido() {

    const itens = carrinho.map(item => ({

        id: item.id,

        nome: item.nome,

        observacao: item.observacao,
        
        quantidade: item.quantidade,

        preco: item.preco,

        subtotal: item.quantidade * item.preco

    }));

    const total = itens.reduce(
        (soma, item) =>
            soma + item.subtotal,
        0
    );

    

    return {

        itens,

        total,

        quantidadeItens:
            itens.reduce(
                (soma, item) =>
                    soma + item.quantidade,
                0
            )

    };

}

function atualizarEstadoCarrinho() {

    const conteudo = document.getElementById('conteudoCarrinho');

    if(carrinhoAberto){

        conteudo.classList.remove(
            'max-h-0',
            'opacity-0',
            'p-0'
        );

        conteudo.classList.add(
            'max-h-[55vh]',
            'opacity-100',
            'p-4'
        );

    } else {

        conteudo.classList.remove(
            'max-h-[55vh]',
            'opacity-100',
            'p-4'
        );

        conteudo.classList.add(
            'max-h-0',
            'opacity-0',
            'p-0'
        );

    }

}