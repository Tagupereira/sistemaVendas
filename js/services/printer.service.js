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

return (
        '\x1B\x40' +

        '\x1B\x61\x01' +
        'DELICIAS FERNANDES\n' +

        '\x1B\x61\x00' +

        '----------------\n' +

        `PEDIDO #${String(venda.pedido).padStart(4,'0')}\n` +

        `TOTAL: R$ ${Number(venda.total)
            .toLocaleString(
                'pt-BR',
                {
                    style:'currency',
                    currency:'BRL'
                }
            )}\n` +

        '\n\n\n' +

        '\x1D\x56\x41'
    );

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