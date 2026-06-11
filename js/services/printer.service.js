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

    export function gerarCupomESC(venda){

const vendaCompleta =
JSON.parse(
venda.vendasJson
);

const dataVenda =
new Date(
venda.data
);

const data =
dataVenda.toLocaleDateString(
'pt-BR'
);

const hora =
dataVenda.toLocaleTimeString(
'pt-BR',
{
hour:'2-digit',
minute:'2-digit'
}
);

const dia =
dataVenda
.toLocaleDateString(
'pt-BR',
{
weekday:'long'
}
)
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'');

const itens =
vendaCompleta
.pedido
.itens
.map(item=>{

const total =
item.preco *
item.quantidade;

return (

`${item.quantidade}x ${item.nome}\n`+

`Unit RS ${item.preco
.toFixed(2)
.replace('.',',')}\n`+

`Total RS ${total
.toFixed(2)
.replace('.',',')}\n`

);

})
.join(
'\n'
);

const pagamentos =
vendaCompleta
.pagamentos
.map(

p=>

`${p.tipo.toUpperCase()}
RS ${p.valor
.toFixed(2)
.replace('.',',')}`

)
.join('\n');

return (

'DELICIAS FERNANDES\n'+

'----------------\n'+

`${dia}\n`+

`${data} ${hora}\n\n`+

`PEDIDO\n`+

`${String(venda.pedido)
.padStart(
4,
'0'
)}\n\n`+

'ITENS\n'+

'----------------\n'+

itens+

'\n'+

'PAGAMENTO\n'+

'----------------\n'+

pagamentos+

'\n\n'+

'TOTAL\n'+

`RS ${Number(venda.total)
.toFixed(2)
.replace('.',',')}\n`+

'\n'+

'Obrigado\n'+

'Nao e documento fiscal\n'+

'\n\n\n'

);

}

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