import { vendasAPI } from '../api/vendas.api.js';
import { saidasAPI } from '../api/saidas.api.js';
import { indicator } from "../services/indicator.service.js";
import { auth } from '../guards/auth.guard.js';
import { menu } from "../components/menu.component.js";
import { toast } from "../components/toast.component.js";
import { animarNumero } from '../utils/animacao.js';

const thema = JSON.parse(localStorage.getItem("tema"));

document.getElementById("temaTopo").setAttribute("fill", thema.hex);
document.querySelector('meta[name="theme-color"]').setAttribute("content", thema.hex);
document.getElementById('btnMenu').classList.add(`${thema.text}`);
document.getElementById('tituloPage').classList.add(`${thema.text}`);
document.getElementById('btnFiltrarPeriodo').classList.add(...`${thema.tailwind} ${thema.text}`.split(' '));

auth();

let vendas = [];
let saidas = [];
let vendasFiltradasAtual = [];
let pagamentosFiltradosAtual = [];

const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const btnFiltrarPeriodo = document.getElementById("btnFiltrarPeriodo");


// =====================================================
// AJUDANTES
// =====================================================

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// aceita número ou texto como "50", "50,00" ou "R$ 1.050,00"
function paraNumero(valor) {

    if (typeof valor === 'number') {
        return valor;
    }

    const limpo = String(valor ?? '')
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.');

    return Number(limpo) || 0;

}

function dataLocalISO(d) {

    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}

// converte para YYYY-MM-DD
function obterDataISO(data) {

    if (!data) {
        return "";
    }

    if (typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return data;
    }

    if (typeof data === "string" && data.includes("T")) {
        return data.split("T")[0];
    }

    const dataObj = new Date(data);

    if (isNaN(dataObj.getTime())) {
        return "";
    }

    return dataLocalISO(dataObj);

}


// =====================================================
// CARREGAMENTO
// =====================================================

window.addEventListener('load', async () => {

    await carregarDados();

});

async function carregarDados() {

    try {

        // const response = await vendasAPI.listar();
        const [response, responseSaidas] = await Promise.all([
            vendasAPI.listar(),
            saidasAPI.listarSaidas()
        ]);

        // lê o JSON de cada venda uma única vez; ignora as que não abrem
        vendas = (response.vendas || []).filter(v => {

            try {
                v._json = JSON.parse(v.vendasJson);
                return true;
            } catch (e) {
                return false;
            }

        });

        // const responseSaidas = await saidasAPI.listarSaidas();
        saidas = responseSaidas.lista || [];

        aplicarAtalho('hoje');

        // renderGrafico();

    } catch (e) {

        console.error(e);

        toast("Erro ao carregar dados", "error");

    }

}


// =====================================================
// PERÍODO
// =====================================================

function marcarAtalho(chave) {

    document.querySelectorAll('.atalho').forEach(b => {

        const ativo = b.dataset.atalho === chave;

        b.classList.toggle('bg-slate-900', ativo);
        b.classList.toggle('text-white', ativo);
        b.classList.toggle('border-slate-900', ativo);

        b.classList.toggle('bg-white', !ativo);
        b.classList.toggle('text-slate-900', !ativo);
        b.classList.toggle('border-slate-300', !ativo);

    });

}

// function aplicarPeriodo(inicio, fim, titulo) {

//     dataInicio.value = inicio;
//     dataFim.value = fim;

//     vendasFiltradasAtual = vendas.filter(v => {

//         const d = obterDataISO(v._json.data);

//         return d >= inicio && d <= fim;

//     });

//     const saidasFiltradas = saidas.filter(s => {

//         const d = obterDataISO(s.dataSaida);

//         return d >= inicio && d <= fim;

//     });

//     document.getElementById("tituloResumo").innerText = titulo;

//     renderResumo(vendasFiltradasAtual);

//     renderSaidas(saidasFiltradas);

//     renderGrafico(inicio === fim ? inicio : null);
// }

function aplicarPeriodo(inicio, fim, titulo) {

    dataInicio.value = inicio;
    dataFim.value = fim;

    // vendas feitas no período (pela data da venda)
    vendasFiltradasAtual = vendas.filter(v => {

        const d = obterDataISO(v._json.data);

        return d >= inicio && d <= fim;

    });

    // pagamentos recebidos no período (pela data do pagamento)
    pagamentosFiltradosAtual = pagamentosRecebidos(inicio, fim);

    const saidasFiltradas = saidas.filter(s => {

        const d = obterDataISO(s.dataSaida);

        return d >= inicio && d <= fim;

    });

    document.getElementById("tituloResumo").innerText = titulo;

    renderResumo(vendasFiltradasAtual);

    renderSaidas(saidasFiltradas);

    renderGrafico(inicio === fim ? inicio : null);

}

// pagamentos sem data própria (feitos na hora da venda) contam na data da venda
function pagamentosRecebidos(inicio, fim) {

    const lista = [];

    vendas.forEach(v => {

        (v._json.pagamentos || []).forEach(p => {

            if (p.tipo === 'pendente') {
                return;
            }

            const d = obterDataISO(p.data || v._json.data);

            if (d >= inicio && d <= fim) {
                lista.push(p);
            }

        });

    });

    return lista;

}
function aplicarAtalho(chave) {

    const fim = dataLocalISO(new Date());

    let inicio = fim;
    let titulo = 'HOJE';

    if (chave === '7dias') {

        const d = new Date();
        d.setDate(d.getDate() - 6);

        inicio = dataLocalISO(d);
        titulo = '7 DIAS';

    }

    if (chave === 'mes') {

        inicio = `${fim.slice(0, 8)}01`;
        titulo = 'MÊS';

    }

    aplicarPeriodo(inicio, fim, titulo);

    marcarAtalho(chave);

}

document.querySelectorAll('.atalho').forEach(b => {

    b.addEventListener('click', () => aplicarAtalho(b.dataset.atalho));

});

btnFiltrarPeriodo.addEventListener("click", () => {

    const inicio = dataInicio.value;
    const fim = dataFim.value;

    const dataHoje = dataLocalISO(new Date());

    if (!inicio || !fim) {

        toast("Informe a data inicial e a data final", "warning");

        return;

    }

    if (inicio > fim) {

        toast("A data inicial não pode ser maior que a data final", "warning");

        return;

    }

    if (fim > dataHoje) {

        toast("O filtro não pode estar no futuro", "warning");

        return;

    }

    const ehHoje = inicio === dataHoje && fim === dataHoje;

    aplicarPeriodo(inicio, fim, ehHoje ? 'HOJE' : 'PERÍODO');

    marcarAtalho(ehHoje ? 'hoje' : null);

    toast("filtro aplicado", "success");

});

function selecionarDia(chave) {

    const hojeISO = dataLocalISO(new Date());

    const titulo = chave === hojeISO
        ? 'HOJE'
        : new Date(`${chave}T00:00:00`)
            .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
            .replace('.', '')
            .toUpperCase();

    aplicarPeriodo(chave, chave, titulo);

    marcarAtalho(chave === hojeISO ? 'hoje' : null);

    window.scrollTo({ top: 0, behavior: 'smooth' });

}

// =====================================================
// CONTAS
// =====================================================

// function totais(lista) {

//     let vendido = 0;
//     let recebido = 0;
//     let pendente = 0;

//     lista.forEach(v => {

//         vendido += Number(v.total || 0);

//         (v._json.pagamentos || []).forEach(p => {

//             if (p.tipo === 'pendente') {
//                 pendente += Number(p.valor || 0);
//             } else {
//                 recebido += Number(p.valor || 0);
//             }

//         });

//     });

//     const centavos = (n) => Math.round(n * 100) / 100;

//     return {
//         vendido: centavos(vendido),
//         recebido: centavos(recebido),
//         pendente: centavos(pendente)
//     };

// }

function totais(lista) {

    let vendido = 0;
    let pendente = 0;

    lista.forEach(v => {

        vendido += Number(v.total || 0);

        (v._json.pagamentos || []).forEach(p => {

            if (p.tipo === 'pendente') {
                pendente += Number(p.valor || 0);
            }

        });

    });

    const centavos = (n) => Math.round(n * 100) / 100;

    return { vendido: centavos(vendido), pendente: centavos(pendente) };

}

function somarValores(pagamentos) {

    const total = pagamentos.reduce((soma, p) => soma + Number(p.valor || 0), 0);

    return Math.round(total * 100) / 100;

}


// =====================================================
// RESUMO
// =====================================================

// function renderResumo(lista) {

//     const animar = (id, valor, formatar = moeda) => {
//         animarNumero(document.getElementById(id), valor, formatar);
//     };

//     const { vendido, recebido, pendente } = totais(lista);

//     const pedidos = lista.length;

//     const ticket = pedidos ? recebido / pedidos : 0;

//     animar('totalPedidos', pedidos, n => String(Math.round(n)));
//     animar('totalVendido', vendido);
//     animar('totalRecebido', recebido);
//     animar('totalPendente', pendente);
//     animar('ticketMedio', ticket);

//     renderFormasPagamento(lista);

//     renderProdutos(lista);

// }

function renderResumo(lista) {

    const animar = (id, valor, formatar = moeda) => {
        animarNumero(document.getElementById(id), valor, formatar);
    };

    const { vendido, pendente } = totais(lista);

    const recebido = somarValores(pagamentosFiltradosAtual);

    const pedidos = lista.length;

    const ticket = pedidos ? vendido / pedidos : 0;

    animar('totalPedidos', pedidos, n => String(Math.round(n)));
    animar('totalVendido', vendido);
    animar('totalRecebido', recebido);
    animar('totalPendente', pendente);
    animar('ticketMedio', ticket);

    renderFormasPagamento(pagamentosFiltradosAtual);

    renderProdutos(lista);

}



// =====================================================
// FORMAS DE PAGAMENTO
// =====================================================

// function renderFormasPagamento(lista) {

//     const formas = {};

//     lista.forEach(v => {

//         (v._json.pagamentos || []).forEach(p => {

//             if (p.tipo === 'pendente') {
//                 return;
//             }

//             formas[p.tipo] = (formas[p.tipo] || 0) + Number(p.valor || 0);

//         });

//     });

//     const container = document.getElementById('formasPagamento');

//     const entradas = Object.entries(formas).sort((a, b) => b[1] - a[1]);

//     if (entradas.length === 0) {

//         container.innerHTML = `
//             <div class="text-center text-slate-500 py-6">
//                 Nenhum pagamento encontrado
//             </div>
//         `;

//         return;

//     }

//     container.innerHTML = entradas.map(([tipo, valor]) => `

//         <div class="flex justify-between items-center py-2 border-t border-slate-100 first:border-t-0">

//             <span class="flex items-center gap-2 capitalize">
//                 <i class="w-2.5 h-2.5 rounded-full bg-green-700"></i>${esc(tipo)}
//             </span>

//             <b class="font-mono">${moeda(valor)}</b>

//         </div>

//     `).join('');

// }

function renderFormasPagamento(pagamentos) {

    const formas = {};

    pagamentos.forEach(p => {

        formas[p.tipo] = (formas[p.tipo] || 0) + Number(p.valor || 0);

    });

    const container = document.getElementById('formasPagamento');

    const entradas = Object.entries(formas).sort((a, b) => b[1] - a[1]);

    if (entradas.length === 0) {

        container.innerHTML = `
            <div class="text-center text-slate-500 py-6">
                Nenhum pagamento encontrado
            </div>
        `;

        return;

    }

    container.innerHTML = entradas.map(([tipo, valor]) => `

        <div class="flex justify-between items-center py-2 border-t border-slate-100 first:border-t-0">

            <span class="flex items-center gap-2 capitalize">
                <i class="w-2.5 h-2.5 rounded-full bg-green-700"></i>${esc(tipo)}
            </span>

            <b class="font-mono">${moeda(valor)}</b>

        </div>

    `).join('');

}


// =====================================================
// PRODUTOS MAIS VENDIDOS
// =====================================================

function renderProdutos(lista) {

    const produtos = {};

    lista.forEach(v => {

        const itens = (v._json.pedido && v._json.pedido.itens) || [];

        itens.forEach(item => {

            if (!produtos[item.nome]) {

                produtos[item.nome] = { quantidade: 0, receita: 0 };

            }

            produtos[item.nome].quantidade += Number(item.quantidade || 0);

            produtos[item.nome].receita += Number(item.preco || 0) * Number(item.quantidade || 0);

        });

    });

    const ranking = Object.entries(produtos)
        .sort((a, b) => b[1].quantidade - a[1].quantidade)
        .slice(0, 50);

    const container = document.getElementById('topProdutos');

    if (ranking.length === 0) {

        container.innerHTML = `
            <div class="text-center text-slate-500 py-6">
                Nenhum produto vendido
            </div>
        `;

        return;

    }

    container.innerHTML = ranking.map(([nome, dados], i) => `

        <div class="flex items-center gap-3 py-2 border-t border-slate-100 first:border-t-0">

            <span class="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">${i + 1}</span>

            <div class="flex-1 min-w-0">
                <div class="font-medium truncate">${esc(nome)}</div>
                <div class="text-xs text-slate-600">${dados.quantidade} un</div>
            </div>

            <b class="font-mono text-green-700">${moeda(dados.receita)}</b>

        </div>

    `).join('');

}


// =====================================================
// SAÍDAS E SALDO
// =====================================================

function renderSaidas(saidasFiltradas) {

    const totalSaidas = saidasFiltradas.reduce(
        (total, saida) => total + paraNumero(saida.valorSaida),
        0
    );

     animarNumero(document.getElementById('totalSaidas'), totalSaidas, moeda);

    document.getElementById('quantidadeSaidas').innerText = `${saidasFiltradas.length} lançamento(s)`;

    //const resultado = totais(vendasFiltradasAtual).recebido - totalSaidas;
    const resultado = somarValores(pagamentosFiltradosAtual) - totalSaidas;

    const saldo = document.getElementById('saldo');

    animarNumero(saldo, resultado, moeda);

    saldo.classList.toggle('text-red-500', resultado < 0);
    saldo.classList.toggle('text-slate-900', resultado >= 0);

}


// =====================================================
// GRÁFICO DOS ÚLTIMOS 7 DIAS
// =====================================================

function renderGrafico(selecionado = null) {

    const dias = [];

    for (let i = 6; i >= 0; i--) {

        const d = new Date();
        d.setDate(d.getDate() - i);

        dias.push(d);

    }

    const porDia = {};

    vendas.forEach(v => {

        const chave = obterDataISO(v._json.data);

        porDia[chave] = (porDia[chave] || 0) + Number(v.total || 0);

    });

    const valores = dias.map(d => porDia[dataLocalISO(d)] || 0);

    const maior = Math.max(...valores, 1);

    const soma = valores.reduce((a, b) => a + b, 0);

    document.getElementById('totalSemana').innerText = moeda(soma);

    const barras = dias.map((d, i) => {

        const chave = dataLocalISO(d);

        const altura = Math.max(4, Math.round((valores[i] / maior) * 96));

        const cor = i === dias.length - 1 ? thema.tailwind : 'bg-slate-200';

        const ativo = chave === selecionado;

        return `
            <button class="barra-dia flex-1 flex flex-col justify-end h-24 rounded-lg ${ativo ? 'ring-2 ring-slate-900' : ''}"
                    data-dia="${chave}"
                    title="${d.toLocaleDateString('pt-BR')}: ${moeda(valores[i])}"
                    aria-label="Ver ${d.toLocaleDateString('pt-BR')}: ${moeda(valores[i])}">
                <div class="${cor} rounded-t-md w-full" style="height:${altura}px"></div>
            </button>
        `;

    }).join('');

    const rotulos = dias.map((d, i) => {

        const nome = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        const destaque = selecionado
            ? dataLocalISO(d) === selecionado
            : i === dias.length - 1;

        return `<span class="flex-1 text-center capitalize ${destaque ? 'font-bold text-slate-900' : ''}">${nome}</span>`;

    }).join('');

    document.getElementById('grafico7dias').innerHTML = `
        <div class="flex items-end gap-2">${barras}</div>
        <div class="flex gap-2 mt-1 text-[11px] text-slate-600">${rotulos}</div>
        <p class="text-xs text-slate-600 mt-3">Toque num dia para ver só ele.</p>
    `;

    document.querySelectorAll('.barra-dia').forEach(b => {

        b.addEventListener('click', () => selecionarDia(b.dataset.dia));

    });

}
// function renderGrafico() {

//     const dias = [];

//     for (let i = 6; i >= 0; i--) {

//         const d = new Date();
//         d.setDate(d.getDate() - i);

//         dias.push(d);

//     }

//     const porDia = {};

//     vendas.forEach(v => {

//         const chave = obterDataISO(v._json.data);

//         porDia[chave] = (porDia[chave] || 0) + Number(v.total || 0);

//     });

//     const valores = dias.map(d => porDia[dataLocalISO(d)] || 0);

//     const maior = Math.max(...valores, 1);

//     const soma = valores.reduce((a, b) => a + b, 0);

//     document.getElementById('totalSemana').innerText = moeda(soma);

//     const barras = dias.map((d, i) => {

//         const altura = Math.max(4, Math.round((valores[i] / maior) * 96));

//         const hoje = i === dias.length - 1;

//         const cor = hoje ? thema.tailwind : 'bg-slate-200';

//         return `
//             <div class="flex-1 flex flex-col justify-end h-24" title="${d.toLocaleDateString('pt-BR')}: ${moeda(valores[i])}">
//                 <div class="${cor} rounded-t-md" style="height:${altura}px"></div>
//             </div>
//         `;

//     }).join('');

//     const rotulos = dias.map((d, i) => {

//         const nome = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

//         const hoje = i === dias.length - 1;

//         return `<span class="flex-1 text-center capitalize ${hoje ? 'font-bold text-slate-900' : ''}">${nome}</span>`;

//     }).join('');

//     document.getElementById('grafico7dias').innerHTML = `
//         <div class="flex items-end gap-2">${barras}</div>
//         <div class="flex gap-2 mt-1 text-[11px] text-slate-600">${rotulos}</div>
//     `;

// }


// =====================================================
// MENU E INICIO
// =====================================================

document.getElementById('btnMenu').addEventListener('click', () => {

    menu.open();

});

function init() {

    auth();

    menu.createMenu();

    indicator();

}

setInterval(() => {

    indicator();

}, 10000);

init();