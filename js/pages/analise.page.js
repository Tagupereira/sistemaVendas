import { vendasAPI } from '../api/vendas.api.js';
import { saidasAPI } from '../api/saidas.api.js';
import { go, goto } from "../routes/routes.js";
import { indicator } from "../services/indicator.service.js";
import { auth } from '../guards/auth.guard.js';
import { menu } from "../components/menu.component.js";
import { toast } from "../components/toast.component.js";


const thema = JSON.parse(localStorage.getItem("tema"));

document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.getElementById('btnMenu').classList.add(`${thema.text}`);
document.getElementById('tituloPage').classList.add(`${thema.text}`);
document.getElementById('btnFiltrarPeriodo').classList.add(...`${thema.tailwind} ${thema.text}`.split(' '));

auth();

let vendas = [];
let saidas = [];


// =====================================================
// CARREGAMENTO
// =====================================================

window.addEventListener('load', async () => {

    await carregarDados();

});


// =====================================================
// CARREGAR VENDAS E SAÍDAS
// =====================================================

async function carregarDados() {

    try {

        const response = await vendasAPI.listar();
        vendas = response.vendas || [];


        const responseSaidas = await saidasAPI.listarSaidas();
        saidas = responseSaidas.lista || [];


        // =============================================
        // INICIAR COM O PERÍODO DE HOJE
        // =============================================

        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        const dataHoje = `${ano}-${mes}-${dia}`;


        // Preenche os campos
        dataInicio.value = dataHoje;
        dataFim.value = dataHoje;


        // Executa a análise automaticamente
        selecionarPeriodo(dataHoje, dataHoje);
        document.getElementById("tituloResumo").innerText = "HOJE"

    } catch (e) {

        console.error(e);

        toast("Erro ao carregar dados", "error");

    }

}


// =====================================================
// FILTRO DE PERÍODO
// =====================================================

const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const btnFiltrarPeriodo = document.getElementById("btnFiltrarPeriodo");


btnFiltrarPeriodo.addEventListener("click", () => {

    const inicio = dataInicio.value;
    const fim = dataFim.value;

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    const dataHoje = `${ano}-${mes}-${dia}`;


    if (!inicio || !fim) {

        toast(
            "Informe a data inicial e a data final",
            "warning"
        );

        return;
    }

    if (inicio > fim) {

        toast(
            "A data inicial não pode ser maior que a data final",
            "warning"
        );

        return;

    }
    if (inicio && fim > dataHoje) {

        toast(
            "O filtro não pode estar no futuro",
            "warning"
        );

        return;

    }

    selecionarPeriodo(inicio, fim);

    if((inicio === dataHoje)&& (fim === dataHoje)){
        document.getElementById("tituloResumo").innerText = "HOJE"
        toast(
            "filtro aplicado",
            "success"
        );

        return;
    }

    document.getElementById("tituloResumo").innerText = "PERÍODO"
    toast(
            "filtro aplicado",
            "success"
        );

});


// =====================================================
// SELECIONAR PERÍODO
// =====================================================

function selecionarPeriodo(inicio, fim) {

    vendasFiltradasAtual = filtrarVendas(inicio, fim);

    const saidasFiltradas = filtrarSaidas(inicio, fim);


    renderResumo(vendasFiltradasAtual);

    renderSaidas(saidasFiltradas);

}


// =====================================================
// CONVERTER DATA PARA YYYY-MM-DD
// =====================================================

function obterDataISO(data) {

    if (!data) {
        return "";
    }


    // Caso já seja YYYY-MM-DD
    if (
        typeof data === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {

        return data;

    }


    // Caso seja ISO: 2026-09-10T...
    if (
        typeof data === "string" &&
        data.includes("T")
    ) {

        return data.split("T")[0];

    }


    const dataObj = new Date(data);


    if (isNaN(dataObj.getTime())) {

        return "";

    }


    const ano = dataObj.getFullYear();

    const mes = String(dataObj.getMonth() + 1).padStart(2, "0");

    const dia = String(dataObj.getDate()).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


// =====================================================
// FILTRAR VENDAS
// =====================================================

function filtrarVendas(inicio, fim) {

    return vendas.filter(v => {

        try {

            const venda = JSON.parse(v.vendasJson);

            const dataVenda = obterDataISO(venda.data);


            return (
                dataVenda >= inicio &&
                dataVenda <= fim
            );


        } catch (e) {

            return false;

        }

    });

}


// =====================================================
// FILTRAR SAÍDAS
// =====================================================

function filtrarSaidas(inicio, fim) {

    return saidas.filter(saida => {

        const dataSaida = obterDataISO(saida.dataSaida);


        return (
            dataSaida >= inicio &&
            dataSaida <= fim
        );

    });

}


// =====================================================
// RESUMO
// =====================================================

function renderResumo(vendas) {

    const totalPedidos = document.getElementById('totalPedidos');
    const totalRecebido = document.getElementById('totalRecebido');
    const ticketMedio = document.getElementById('ticketMedio');
    const formasPagamento = document.getElementById('formasPagamento');
    const topProdutos = document.getElementById('topProdutos');
    const totalPendente = document.getElementById('totalPendente');


    // -------------------------------------------------
    // NENHUMA VENDA
    // -------------------------------------------------

    if (vendas.length === 0) {

        totalPedidos.innerText = '0';

        totalRecebido.innerText = 'R$ 0,00';

        ticketMedio.innerText = 'R$ 0,00';


        formasPagamento.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                Nenhuma venda encontrada
            </div>
        `;


        topProdutos.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                Nenhum produto vendido
            </div>
        `;


        totalPendente.innerText = 'R$ 0,00';


        return;

    }


    // -------------------------------------------------
    // TOTAL DE PEDIDOS
    // -------------------------------------------------

    const pedidos = vendas.length;


    // -------------------------------------------------
    // TOTAL RECEBIDO
    // -------------------------------------------------

    const recebido = vendas.reduce((total, v) => {

        try {

            const venda = JSON.parse(v.vendasJson);


            const totalRecebido = venda.pagamentos
                .filter(p => p.tipo !== 'pendente')
                .reduce(
                    (soma, p) => soma + Number(p.valor || 0),
                    0
                );


            return total + totalRecebido;


        } catch (e) {

            return total;

        }

    }, 0);


    // -------------------------------------------------
    // TICKET MÉDIO
    // -------------------------------------------------

    const ticket = pedidos
        ? recebido / pedidos
        : 0;


    // -------------------------------------------------
    // MOSTRAR RESUMO
    // -------------------------------------------------

    totalPedidos.innerText = pedidos;


    totalRecebido.innerText =
        `R$ ${recebido.toFixed(2).replace('.', ',')}`;


    ticketMedio.innerText =
        `R$ ${ticket.toFixed(2).replace('.', ',')}`;


    // -------------------------------------------------
    // OUTROS RESUMOS
    // -------------------------------------------------

    renderFormasPagamento(vendas);

    renderProdutos(vendas);

    renderPendentes(vendas);

}


// =====================================================
// FORMAS DE PAGAMENTO
// =====================================================

function renderFormasPagamento(vendas) {

    const formas = {};


    vendas.forEach(v => {

        try {

            const venda = JSON.parse(v.vendasJson);


            venda.pagamentos.forEach(p => {

                if (p.tipo === 'pendente') {
                    return;
                }


                if (!formas[p.tipo]) {

                    formas[p.tipo] = 0;

                }


                formas[p.tipo] += Number(p.valor || 0);

            });


        } catch (e) {

            console.error(e);

        }

    });


    const container =
        document.getElementById('formasPagamento');


    container.innerHTML = '';


    const entradas = Object.entries(formas);


    if (entradas.length === 0) {

        container.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                Nenhum pagamento encontrado
            </div>
        `;

        return;

    }


    entradas.forEach(([tipo, valor]) => {

        container.innerHTML += `

            <div class="flex justify-between mb-4">

                <span>
                    ${tipo.toUpperCase()}
                </span>

                <span class="font-bold">
                    R$ ${valor.toFixed(2).replace('.', ',')}
                </span>

            </div>

        `;

    });

}


// =====================================================
// PENDENTES
// =====================================================

function renderPendentes(vendas) {

    let totalPendente = 0;


    vendas.forEach(v => {

        try {

            const venda = JSON.parse(v.vendasJson);


            venda.pagamentos.forEach(p => {

                if (p.tipo !== 'pendente') {
                    return;
                }


                totalPendente += Number(p.valor || 0);

            });


        } catch (e) {

            console.error(e);

        }

    });


    const elemento =
        document.getElementById('totalPendente');


    elemento.innerText =
        `R$ ${totalPendente.toFixed(2).replace('.', ',')}`;

}


// =====================================================
// PRODUTOS
// =====================================================

function renderProdutos(vendas) {

    const produtos = {};


    vendas.forEach(v => {

        try {

            const venda = JSON.parse(v.vendasJson);


            venda.pedido.itens.forEach(item => {

                if (!produtos[item.nome]) {

                    produtos[item.nome] = {
                        quantidade: 0,
                        receita: 0
                    };

                }


                produtos[item.nome].quantidade +=
                    Number(item.quantidade || 0);


                produtos[item.nome].receita +=
                    Number(item.preco || 0) *
                    Number(item.quantidade || 0);

            });


        } catch (e) {

            console.error(e);

        }

    });


    const ranking = Object.entries(produtos)

        .sort(
            (a, b) =>
                b[1].quantidade -
                a[1].quantidade
        )

        .slice(0, 50);


    const container =
        document.getElementById('topProdutos');


    container.innerHTML = '';


    if (ranking.length === 0) {

        container.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                Nenhum produto vendido
            </div>
        `;

        return;

    }


    ranking.forEach(([nome, dados], index) => {

        container.innerHTML += `

            <div class="mb-4">

                <div class="flex justify-between">

                    <div>
                        ${index + 1}° ${nome}
                    </div>

                    <div>
                        ${dados.quantidade} un
                    </div>

                </div>


                <div class="text-green-600 font-semibold text-right">

                    R$ ${dados.receita
                        .toFixed(2)
                        .replace('.', ',')}

                </div>

            </div>

        `;

    });

}


// =====================================================
// SAÍDAS
// =====================================================

function renderSaidas(saidasFiltradas) {

    const totalSaidas =
        saidasFiltradas.reduce(
            (total, saida) => {

                return total +
                    Number(saida.valorSaida || 0);

            },
            0
        );


    const elemento =
        document.getElementById('totalSaidas');


    elemento.innerText =
        `-R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;


    // Quantidade de saídas, caso exista no HTML
    const quantidade =
        document.getElementById('quantidadeSaidas');


    if (quantidade) {

        quantidade.innerText =
            saidasFiltradas.length;

    }


    // Saldo, caso exista no HTML
    const saldo =
        document.getElementById('saldo');


    if (saldo) {

        // Aqui usamos o valor recebido das vendas
        // menos as saídas.

        const recebido =
            obterTotalRecebido(vendasFiltradasAtual);


        const resultado =
            recebido - totalSaidas;

        if(resultado < 0){
            saldo.classList.add("text-red-500")
        }
        saldo.innerText = `R$ ${resultado.toFixed(2).replace('.', ',')}`;

    }

}


// =====================================================
// TOTAL RECEBIDO AUXILIAR
// =====================================================

function obterTotalRecebido(vendas) {

    return vendas.reduce((total, v) => {

        try {

            const venda =
                JSON.parse(v.vendasJson);


            const recebido =
                venda.pagamentos

                    .filter(p => p.tipo !== 'pendente')

                    .reduce(
                        (soma, p) =>
                            soma + Number(p.valor || 0),
                        0
                    );


            return total + recebido;


        } catch (e) {

            return total;

        }

    }, 0);

}


// =====================================================
// VENDAS DO PERÍODO ATUAL
// =====================================================

let vendasFiltradasAtual = [];


// =====================================================
// MENU
// =====================================================

const btn = document.getElementById('btnMenu');

btn.addEventListener(
    'click',
    abrirMenu
);


function abrirMenu() {

    menu.open();

}


// =====================================================
// INIT
// =====================================================

function init() {

    auth();

    menu.createMenu();

    indicator();

}


setInterval(() => {

    indicator();

}, 10000);


init();