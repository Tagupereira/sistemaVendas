let printerDevice = null;
let printerChar = null;
let printer = null;
const empresa = JSON.parse(localStorage.getItem("empresa"));

// export async function conectar() {

//     // 1. se já tem tudo pronto na memória da página atual, ok
//     if (
//         printerDevice && printerChar
//     ) {

//         try {

//             await printerDevice.gatt.connect();

//             return;

//         } catch {

//             printerDevice = null;
//             printerChar = null;

//         }

//     }

//     // [NOVO] 2. Se mudou de página e as variáveis sumiram, tenta recuperar o histórico
//     if (!printerDevice) {
//         try {
//             // Pede ao navegador a lista de aparelhos já autorizados antes
//             const devices = await navigator.bluetooth.getDevices();
            
//             const device = devices.find( d => d.name === 'MPT-II' );

//             if (device) {

//                 printerDevice = device;

//             }

//         } catch (e) {
//             console.warn("Erro ao buscar histórico de dispositivos:", e);
//         }
//     }

//     // 3. se já tem o device (seja da memória ou do histórico do getDevices) → conecta direto
//     if (printerDevice) {
//         try {
//             const server =
//                 await printerDevice.gatt.connect();

//             const service =
//                 await server.getPrimaryService(0x18F0);

//             const chars =
//                 await service.getCharacteristics();

//             printerChar =
//                 chars.find(c =>
//                     c.properties.write ||
//                     c.properties.writeWithoutResponse
//                 );

//             printer =
//                 printerDevice;

//             return;

//         } catch (e) {
//             // se falhar (ex: impressora desligou), limpa tudo para forçar o pop-up
//             printerDevice = null;
//             printerChar = null;
//         }
//     }

//     // 4. Primeira conexão da vida (abre popup só se não houver histórico)
//     const device =
//         await navigator.bluetooth.requestDevice({
//             acceptAllDevices: true,
//             //optionalServices: [0x18F0]
//             optionalServices: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2']
//         });

//     printerDevice = device;

//     const server =
//         await device.gatt.connect();

//     const service =
//         await server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
//     // const service =
//     //     await server.getPrimaryService(0x18F0);

//     const chars =
//         await service.getCharacteristics();

//     printerChar =
//         chars.find(c =>
//             c.properties.write ||
//             c.properties.writeWithoutResponse
//         );

//     printer = device;
// };

const CHAVE_IMPRESSORA = 'impressora';

// serviços Bluetooth que as impressoras térmicas costumam usar para receber os dados
const SERVICOS = [
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    0x18F0,
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    0xFFE0
];

function lerImpressoraSalva() {

    try {
        return JSON.parse(localStorage.getItem(CHAVE_IMPRESSORA)) || null;
    } catch {
        return null;
    }

}

function salvarImpressora(device) {

    localStorage.setItem(CHAVE_IMPRESSORA, JSON.stringify({
        id: device.id,
        name: device.name || ''
    }));

}

export function nomeImpressoraSalva() {

    const salva = lerImpressoraSalva();

    return salva ? (salva.name || 'Impressora sem nome') : '';

}

// esquece a impressora salva, para escolher outra na próxima impressão
export async function esquecerImpressora() {

    localStorage.removeItem(CHAVE_IMPRESSORA);

    try {
        if (printerDevice && printerDevice.gatt && printerDevice.gatt.connected) {
            printerDevice.gatt.disconnect();
        }
    } catch { }

    try {

        const devices = navigator.bluetooth.getDevices
            ? await navigator.bluetooth.getDevices()
            : [];

        for (const d of devices) {
            if (d.forget) {
                await d.forget();
            }
        }

    } catch { }

    printerDevice = null;
    printerChar = null;
    printer = null;

}

// espera o aparelho "avisar que está por perto" (até 4 segundos)
async function esperarAnuncio(device, tempo = 4000) {

    if (!device.watchAdvertisements) {
        return;
    }

    const controle = new AbortController();

    try {

        await new Promise(resolve => {

            const timer = setTimeout(resolve, tempo);

            device.addEventListener('advertisementreceived', () => {
                clearTimeout(timer);
                resolve();
            }, { once: true });

            device.watchAdvertisements({ signal: controle.signal }).catch(resolve);

        });

    } finally {

        controle.abort();

    }

}

// conecta e procura o canal onde a impressora recebe os dados
async function abrirCanal(device) {

    const server = await device.gatt.connect();

    const servicos = await server.getPrimaryServices();

    for (const servico of servicos) {

        const caracteristicas = await servico.getCharacteristics();

        const escrita = caracteristicas.find(c =>
            c.properties.write || c.properties.writeWithoutResponse
        );

        if (escrita) {

            printerDevice = device;
            printerChar = escrita;
            printer = device;

            return true;

        }

    }

    return false;

}

async function conectarComTentativas(device) {

    try {
        return await abrirCanal(device);
    } catch (e) {
        console.warn('Primeira tentativa de conexão falhou:', e);
    }

    await esperarAnuncio(device);

    try {
        return await abrirCanal(device);
    } catch (e) {
        console.warn('Segunda tentativa de conexão falhou:', e);
        return false;
    }

}

// procura, entre os aparelhos já autorizados, a impressora usada antes
async function buscarImpressoraPermitida() {

    if (!navigator.bluetooth || !navigator.bluetooth.getDevices) {
        return null;
    }

    try {

        const devices = await navigator.bluetooth.getDevices();

        const salva = lerImpressoraSalva();

        return (
            devices.find(d => salva && d.id === salva.id) ||
            devices.find(d => salva && salva.name && d.name === salva.name) ||
            devices.find(d => d.name === 'MPT-II') ||
            devices[0] ||
            null
        );

    } catch (e) {

        console.warn('Não foi possível listar impressoras já autorizadas:', e);

        return null;

    }

}

export async function conectar() {

    // 1. já está conectada nesta página
    if (printerDevice && printerDevice.gatt && printerDevice.gatt.connected && printerChar) {
        return;
    }

    // 2. conexão que caiu, ou impressora já autorizada em outra tela: reconecta sem abrir a lista
    const conhecida = printerDevice || await buscarImpressoraPermitida();

    if (conhecida && await conectarComTentativas(conhecida)) {

        salvarImpressora(conhecida);

        return;

    }

    // 3. última opção: abre a lista, mostrando só a impressora conhecida (se houver)
    const salva = lerImpressoraSalva();

    const opcoes = (salva && salva.name)
        ? { filters: [{ name: salva.name }], optionalServices: SERVICOS }
        : { acceptAllDevices: true, optionalServices: SERVICOS };

    const device = await navigator.bluetooth.requestDevice(opcoes);

    if (!(await conectarComTentativas(device))) {
        throw new Error('Nao foi possivel abrir o canal de impressao');
    }

    salvarImpressora(device);

};


export function impressoraConectada() {

    return Boolean(

        printer?.gatt?.connected &&
        printerChar

    );

};

export async function imprimir(texto) {

    // SEMPRE valida conexão
    await conectar();

    const bytes =
        new TextEncoder()
            .encode(
                limparTexto(
                    texto
                )
            );

    const tamanhoBloco =
        100;

    for (
        let i = 0;
        i < bytes.length;
        i += tamanhoBloco
    ) {

        const bloco =
            bytes.slice(
                i,
                i + tamanhoBloco
            );

        //await printerChar.writeValueWithoutResponse(bloco);
        if (printerChar.properties.writeWithoutResponse) {
            await printerChar.writeValueWithoutResponse(bloco);
        } else {
            await printerChar.writeValue(bloco);
        }

        await esperar(
            80
        );

    }

};

function esperar(ms) {

    return new Promise(

        resolve =>

            setTimeout(
                resolve,
                ms
            )

    );

};

// export function gerarCupomESC(venda) {
   
//     const cliente = venda.cliente.toUpperCase();

//     const vendaCompleta = JSON.parse(venda.vendasJson);

//     const dataVenda = new Date(venda.data);

//     const data = dataVenda.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

//     const hora = dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

//     const dia = dataVenda.toLocaleDateString('pt-BR', { weekday: 'long' }).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
//     // const obs = venda.obsPedido;
//     const obs = venda.obsPedido ?? vendaCompleta.obsPedido ?? '';

//     let recebeTroco = alinhar('Troco:', `RS ${Number(0).toFixed(2).replace('.', ',')}` );
//     let dimRecebido = alinhar('Troco:', `RS ${Number(0).toFixed(2).replace('.', ',')}` );
      
//     //console.log("venda: ",venda);
//     if(venda.troco){

//         if(venda.troco.troco > 0){
//             recebeTroco = alinhar('Troco:', `RS ${Number(venda.troco.troco).toFixed(2).replace('.', ',')}` );
//             dimRecebido = alinhar('Dinheiro recebido:', `RS ${Number(venda.troco.recebido).toFixed(2).replace('.', ',')}` );
//         }
//     }else{
//         recebeTroco="";
//         dimRecebido="";
//     }

//     const itens = vendaCompleta.pedido.itens.map(item => {
    
//         const total = item.preco * item.quantidade;
    
//         const obs = item.observacao;

//         return (
//             alinhar(

//                 `${item.quantidade}x ${item.nome.toUpperCase()}`,

//                 `RS ${total.toFixed(2).replace('.', ',')}`

//             )
//             +

//             (item.observacao?`\n OBS: ${item.observacao}` : '' )

//         );

//     }).join('\n\n');

//     const pagamentos =
//         vendaCompleta
//             .pagamentos
//             .map(

//                 p =>

//                     alinhar(

//                         p.tipo
//                             .toUpperCase(),

//                         `RS ${p.valor
//                             .toFixed(2)
//                             .replace('.', ',')}`

//                     )

//             )
//             .join('\n');

//             //console.log(vendaCompleta);
            
//     return (
//         centralizar(`${empresa.nome}`) + '\n' +

//         `${data} - ${hora}\n` +

//         '\n' +
//         alinhar('CLIENTE:', cliente + '\n' )+
        
//         alinhar(
//             'PEDIDO:',
//             ` #${String(venda.pedido)
//                 .padStart(
//                     4,
//                     '0'
//                 )}`
//         ) + 

//         '\n' + 

//         '--------------------------------\n' +

//         itens +

//         '\n' +
      

//         '--------------------------------\n' +

//         pagamentos +

//         '\n\n' +
        
//         '--------------------------------\n' +

//         alinhar('TOTAL', `RS ${Number(venda.total).toFixed(2).replace('.', ',')}`)
//         + '\n' +

//         dimRecebido + '\n' +

//         recebeTroco + 
        
//         'Obs: \n' +
//         obs + '\n\n'+
       
//         centralizar('CUPOM NAO FISCAL') + '\n' +

//         centralizar('Obrigado pela sua compra!') + '\n\n\n\n'

//     );


// };

export function gerarCupomESC(venda) {

    const largura = 32;

    const linha = '-'.repeat(largura);

    const vendaCompleta = JSON.parse(venda.vendasJson);

    const dataVenda = new Date(venda.data);

    const data = dataVenda.toLocaleDateString('pt-BR');

    const hora = dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const obs = venda.obsPedido ?? vendaCompleta.obsPedido ?? '';

    const cliente = venda.cliente || 'Nao identificado';

    const cap = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);

    // itens
    const itens = (vendaCompleta.pedido.itens || []).map(item => {

        const total = Number(item.preco) * Number(item.quantidade);

        let texto = alinharOuQuebrar(`${item.quantidade}x ${item.nome}`, reais(total), largura);

        if (item.observacao) {

            texto += '\n' + quebrarTexto('Obs: ' + item.observacao, largura - 1)
                .split('\n')
                .map(l => ' ' + l)
                .join('\n');

        }

        return texto;

    }).join('\n');

    // pagamentos
    const pagamentos = vendaCompleta.pagamentos || [];

    let textoPagamentos;

    if (
        pagamentos.length === 1 &&
        pagamentos[0].tipo !== 'pendente' &&
        !(Number(pagamentos[0].troco) > 0)
    ) {

        textoPagamentos = cap(pagamentos[0].tipo);

    } else {

        textoPagamentos = pagamentos.map(p => {

            let texto = alinhar(cap(p.tipo), reais(p.valor), largura);

            if (p.tipo !== 'pendente' && Number(p.troco) > 0) {

                texto += '\n' + alinhar(' Recebido', reais(p.recebido), largura);
                texto += '\n' + alinhar(' Troco', reais(p.troco), largura);

            }

            return texto;

        }).join('\n');

    }

    const blocos = [];

    blocos.push(centralizarTexto(empresa.nome || '', largura) + '\n\n');
    
    blocos.push(`Realizado em ${data} - ${hora}`);
    blocos.push(`Pedido: #${String(venda.pedido).padStart(4, '0')}`);
    blocos.push(linha);
    blocos.push(itens);
    blocos.push(linha);
    blocos.push(alinhar('Total', reais(venda.total), largura));
    blocos.push(linha);

    if (obs) {

        blocos.push('Obs:\n' + quebrarTexto(obs, largura));
        blocos.push(linha);

    }

    blocos.push('Forma de pagamento\n' + textoPagamentos);
    blocos.push(linha);
    //blocos.push('Cliente\n' + quebrarTexto(cliente, largura));
    blocos.push(quebrarTexto('Cliente: ' + cliente, largura));
    blocos.push(linha);
    blocos.push(centralizar('Cupom nao fiscal', largura) + '\n' + centralizar('Obrigado pela preferencia', largura));

    return blocos.join('\n') + '\n\n\n\n';

};


export function gerarSenhaEvento(venda) {

    const dataVenda = new Date(venda.data);

    const data = dataVenda.toLocaleDateString('pt-BR',
                {
                    day: '2-digit',
                    month: '2-digit'
                }
            );

    const hora = dataVenda.toLocaleTimeString('pt-BR',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );

    return (

        '\n' +

        centralizar(
            `${empresa.nome}`
        ) +

        '\n' +

        centralizar(
            'RETIRE NO BALCAO'
        ) +

        '\n' +

        '--------------------------------\n' +

        '\n' +

        centralizar(
            'PEDIDO'
        ) +

        '\n' +

        '\n' +

        centralizar(
            '################'
        ) +

        '\n' +

        centralizar(
            String(
                venda.pedido
            )
                .padStart(
                    4,
                    '0'
                )
        ) +

        '\n' +

        centralizar(
            '################'
        ) +

        '\n' +

        '\n' +

        centralizar(
            `${data} - ${hora}`
        ) +

        '\n' +

        '\n' +

        centralizar(
            'AGUARDE CHAMADA'
        ) +

        '\n' +

        centralizar(
            'NO GRUPO'
        ) +

        '\n\n\n\n'

    );

};

function limparTexto(texto) {

    return texto

        .normalize('NFD')

        .replace(/[\u0300-\u036f]/g, '')

        .replace(/\u00a0/g, ' ')

        .replace(/[^\w\s.,()\-/#:$]/g, '');

};

// R$ 1.234,50 (sem espaços especiais que a impressora não entende)
function reais(valor) {

    const [inteiro, centavos] = Number(valor || 0).toFixed(2).split('.');

    return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;

}

// quebra um texto em linhas de até "largura" caracteres, sem cortar palavras
function quebrarTexto(texto, largura = 32) {

    const palavras = String(texto).split(/\s+/).filter(Boolean);

    const linhas = [];

    let atual = '';

    palavras.forEach(p => {

        if ((atual + ' ' + p).trim().length <= largura) {

            atual = (atual + ' ' + p).trim();

            return;

        }

        if (atual) {
            linhas.push(atual);
        }

        atual = p;

        while (atual.length > largura) {

            linhas.push(atual.slice(0, largura));

            atual = atual.slice(largura);

        }

    });

    if (atual) {
        linhas.push(atual);
    }

    return linhas.join('\n');

}

// texto à esquerda e valor à direita; se não couber, o valor desce para a linha de baixo
function alinharOuQuebrar(esquerda, direita, largura = 32) {

    if (esquerda.length + direita.length + 1 <= largura) {
        return alinhar(esquerda, direita, largura);
    }

    return quebrarTexto(esquerda, largura) + '\n' + alinhar('', direita, largura);

}

// centraliza cada linha de um texto que pode ocupar mais de uma
function centralizarTexto(texto, largura = 32) {

    return quebrarTexto(texto, largura)
        .split('\n')
        .map(l => centralizar(l, largura))
        .join('\n');

}

function alinhar(
    esquerda,
    direita,
    largura = 32
) {

    esquerda =
        String(
            esquerda
        );

    direita =
        String(
            direita
        );

    const espacos =
        Math.max(
            1,
            largura -
            esquerda.length -
            direita.length
        );

    return (

        esquerda +

        ' '.repeat(
            espacos
        ) +

        direita

    );

};

function centralizar(
    texto,
    largura = 32
) {

    texto =
        String(
            texto
        );

    const espacos =
        Math.max(
            0,
            Math.floor(
                (
                    largura -
                    texto.length
                )
                / 2
            )
        );

    return (

        ' '.repeat(
            espacos
        )

        +

        texto

    );

};