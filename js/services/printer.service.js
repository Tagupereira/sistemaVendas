let printer;
let printerChar;

export async function conectar() {

    if (printer?.gatt?.connected && printerChar) {
        return;
    }

    const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: [0x18F0] });

    const server = await device.gatt.connect();

    const service = await server.getPrimaryService(0x18F0);

    const chars = await service.getCharacteristics();

    printerChar = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);

    printer = device;


}

export function impressoraConectada() {

    return Boolean(

        printer?.gatt?.connected &&
        printerChar

    );

}

export async function imprimir(texto) {

    if (!printerChar) {

        await conectar();

    }

    const bytes =
        new TextEncoder()
            .encode(
                limparTexto(
                    texto
                )
            );

    const tamanhoBloco = 100;

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

        await printerChar.writeValueWithoutResponse(
            bloco.buffer
        );

        await esperar(
            80
        );

    }

}

function esperar(ms) {

    return new Promise(

        resolve =>

            setTimeout(
                resolve,
                ms
            )

    );

}

export function gerarCupomESC(venda) {
   
    const vendaCompleta = JSON.parse(venda.vendasJson);

    const dataVenda = new Date(venda.data);

    const data = dataVenda.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

    const hora = dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const dia = dataVenda.toLocaleDateString('pt-BR', { weekday: 'long' }).normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const itens = vendaCompleta.pedido.itens.map(item => {
        const total = item.preco * item.quantidade;

        return (
            alinhar(

                `${item.quantidade}x ${item.nome.toUpperCase()}`,

                `RS ${total
                    .toFixed(2)
                    .replace('.', ',')}`

            )

        );

    })
        .join('\n');

    const pagamentos =
        vendaCompleta
            .pagamentos
            .map(

                p =>

                    alinhar(

                        p.tipo
                            .toUpperCase(),

                        `RS ${p.valor
                            .toFixed(2)
                            .replace('.', ',')}`

                    )

            )
            .join('\n');

    return (
        centralizar('DELICIAS FERNANDES') + '\n' +

        `${data} - ${hora}\n` +

        '\n' +

        
        alinhar(
            'PEDIDO:',
            ` #${String(venda.pedido)
                .padStart(
                    4,
                    '0'
                )}`
        ) + 

        '\n' + 

        '--------------------------------\n' +

        itens +

        '\n' +

        '--------------------------------\n' +

        pagamentos +

        '\n' +

        '--------------------------------\n' +

        alinhar('TOTAL', `RS ${Number(venda.total).toFixed(2).replace('.', ',')}`)
        + '\n\n' +

        centralizar('CUPOM NAO FISCAL') + '\n' +

        centralizar('Obrigado pela sua compra!') + '\n\n\n\n'

    );


}



export function gerarSenhaEvento(venda) {

    const dataVenda =
        new Date(
            venda.data
        );

    const data =
        dataVenda
            .toLocaleDateString(
                'pt-BR',
                {
                    day: '2-digit',
                    month: '2-digit'
                }
            );

    const hora =
        dataVenda
            .toLocaleTimeString(
                'pt-BR',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );

    return (

        '\n' +

        centralizar(
            'DELICIAS FERNANDES'
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

}



function limparTexto(texto) {

    return texto

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .replace(
            /[^\w\s.,()\-/#:]/g,
            ''

        )

        .replaceAll(
            'R$',
            'RS'
        )

        .replaceAll(
            '°',
            ''
        );

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

}

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

}