let printer;
let printerChar;

export async function conectar() {

    if (printerChar) {
        return;
    }

    const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: [0x18F0] });

    const server = await device.gatt.connect();

    const service = await server.getPrimaryService( 0x18F0 );

    const chars = await service.getCharacteristics();

    printerChar = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);

    printer = device;

}

export async function imprimir(texto) {

    if (!printerChar) {

        await conectar();

    }

    const bytes = new TextEncoder().encode(limparTexto(texto)).buffer;

    await printerChar.writeValueWithoutResponse(bytes);

    alert('solicitando impressao')

}

export function gerarCupomESC(venda){

    const vendaCompleta = JSON.parse(venda.vendasJson);
    
    const dataVenda = new Date(venda.data);
    
    const data = dataVenda.toLocaleDateString('pt-BR');
    
    const hora = dataVenda.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
     
    const diaSemana = dataVenda.toLocaleDateString('pt-BR', { weekday:'long' });
    
     const itens = vendaCompleta.pedido.itens.map(item =>
        `- _${item.quantidade}x ${item.nome} Únit: ${item.preco.toLocaleString('pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}_
        *Total: ${(item.preco * item.quantidade).toLocaleString('pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}*`

    ).join('\n\n');

    const pagamentos = vendaCompleta.pagamentos.map(pagamento =>

        `${pagamento.tipo.toUpperCase()}: ${pagamento.valor.toLocaleString(
            'pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}`

    ).join('\n');

    const cupom = `

    DELÍCIAS FERNANDES  


${diaSemana}, ${data} - ${hora} 
    
Pedido: #${String(venda.pedido).padStart(4,'0')}
========================
ITENS:
${itens}
========================
PAGAMENTO:

${pagamentos}

VALOR TOTAL: ${Number(venda.total).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}
========================

Obrigado pela preferência!

Cupom de compra - Não é documento fiscal. \n` +

        '\n\n\n' +

        '\x1D\x56\x41';


return cupom;

//(
//         '\x1B\x40' +

//         '\x1B\x61\x01' +
//         'DELICIAS FERNANDES\n' +

//         '\x1B\x61\x00' +

//         '----------------\n' +

//         `PEDIDO #${String(venda.pedido).padStart(4,'0')}\n` +
        
//         `ITENS: \n` +

//         `TOTAL: R$ ${Number(venda.total)
//             .toLocaleString(
//                 'pt-BR',
//                 {
//                     style:'currency',
//                     currency:'BRL'
//                 }
//             )}\n` +

//         '\n\n\n' +

//         '\x1D\x56\x41'
//     );

}

function limparTexto(texto){

    return texto

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
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