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
        `- ${item.quantidade}x ${item.nome} Únit: ${item.preco.toLocaleString('pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}
        Total: ${(item.preco * item.quantidade).toLocaleString('pt-BR',
            {
                style:'currency',
                currency:'BRL'
            }
        )}`

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

    const cupom = 

    '\x1B\x40'+

'\x1B\x61\x01'+

'DELICIAS FERNANDES\n'+

'\x1B\x61\x00'+

`${diaSemana}\n`+
`${data} ${hora}\n\n`+

`PEDIDO:
#${String(venda.pedido)
.padStart(
4,
'0'
)}\n`+

'================\n'+

'ITENS\n'+

'================\n'+

itens+

'\n'+

'PAGAMENTO\n'+

'================\n'+

pagamentos+

'\n\n'+

`TOTAL\n`+

`RS ${Number(
venda.total
)
.toFixed(2)
.replace('.',',')}\n`+

'\n'+

'Obrigado!\n'+

'Nao e documento fiscal\n'+

'\n\n\n';


return cupom;

}

function limparTexto(texto){

    return texto

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .replace(
            /[^\w\s.,()-]/g,
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