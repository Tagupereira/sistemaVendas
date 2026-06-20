let printerDevice = null;
let printerChar = null;
let printer = null;


export async function conectar() {

    // 1. se já tem tudo pronto na memória da página atual, ok
    if (
        printerDevice && printerChar
    ) {

        try {

            await printerDevice.gatt.connect();

            return;

        } catch {

            printerDevice = null;
            printerChar = null;

        }

    }

    // [NOVO] 2. Se mudou de página e as variáveis sumiram, tenta recuperar o histórico
    if (!printerDevice) {
        try {
            // Pede ao navegador a lista de aparelhos já autorizados antes
            const devices = await navigator.bluetooth.getDevices();
            
            const device = devices.find( d => d.name === 'MPT-II' );

            if (device) {

                printerDevice = device;

            }

        } catch (e) {
            console.warn("Erro ao buscar histórico de dispositivos:", e);
        }
    }

    // 3. se já tem o device (seja da memória ou do histórico do getDevices) → conecta direto
    if (printerDevice) {
        try {
            const server =
                await printerDevice.gatt.connect();

            const service =
                await server.getPrimaryService(0x18F0);

            const chars =
                await service.getCharacteristics();

            printerChar =
                chars.find(c =>
                    c.properties.write ||
                    c.properties.writeWithoutResponse
                );

            printer =
                printerDevice;

            return;

        } catch (e) {
            // se falhar (ex: impressora desligou), limpa tudo para forçar o pop-up
            printerDevice = null;
            printerChar = null;
        }
    }

    // 4. Primeira conexão da vida (abre popup só se não houver histórico)
    const device =
        await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            //optionalServices: [0x18F0]
            optionalServices: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2']
        });

    printerDevice = device;

    const server =
        await device.gatt.connect();

    const service =
        await server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
    // const service =
    //     await server.getPrimaryService(0x18F0);

    const chars =
        await service.getCharacteristics();

    printerChar =
        chars.find(c =>
            c.properties.write ||
            c.properties.writeWithoutResponse
        );

    printer = device;
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

        await printerChar
            .writeValueWithoutResponse(
                bloco
            );

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

export function gerarCupomESC(venda) {
   
    const vendaCompleta = JSON.parse(venda.vendasJson);

    const dataVenda = new Date(venda.data);

    const data = dataVenda.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

    const hora = dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const dia = dataVenda.toLocaleDateString('pt-BR', { weekday: 'long' }).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    let recebeTroco = alinhar('Troco:', `RS ${Number(0).toFixed(2).replace('.', ',')}` );
    let dimRecebido = alinhar('Troco:', `RS ${Number(0).toFixed(2).replace('.', ',')}` );
      
    //console.log("venda: ",venda);
    if(venda.troco){

        if(venda.troco.troco > 0){
            recebeTroco = alinhar('Troco:', `RS ${Number(venda.troco.troco).toFixed(2).replace('.', ',')}` );
            dimRecebido = alinhar('Dinheiro recebido:', `RS ${Number(venda.troco.recebido).toFixed(2).replace('.', ',')}` );
        }
    }else{
        recebeTroco="";
        dimRecebido="";
    }

    const itens = vendaCompleta.pedido.itens.map(item => {
    
        const total = item.preco * item.quantidade;
    
        const obs = item.observacao;

        return (
            alinhar(

                `${item.quantidade}x ${item.nome.toUpperCase()}`,

                `RS ${total.toFixed(2).replace('.', ',')}`

            )
            +

            (item.observacao?`\n OBS: ${item.observacao}` : '' )

        );

    }).join('\n\n');

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

            //console.log(vendaCompleta);
            
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

        '\n\n' +
        
        '--------------------------------\n' +

        alinhar('TOTAL', `RS ${Number(venda.total).toFixed(2).replace('.', ',')}`)
        + '\n' +

        dimRecebido + '\n' +

        recebeTroco +

        '\n\n' +
       
        centralizar('CUPOM NAO FISCAL') + '\n' +

        centralizar('Obrigado pela sua compra!') + '\n\n\n\n'

    );


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

};

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

};

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