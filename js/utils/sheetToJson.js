export function sheetToJson(nomeAba) {

  const sheet =
    SpreadsheetApp
      .getActive()
      .getSheetByName(nomeAba);

  const dados =
    sheet.getDataRange()
      .getValues();

  const headers = dados.shift();

  return dados
    .filter(linha =>
      linha.some(celula => celula !== '')
    )
    .map(linha => {

      const obj = {};

      headers.forEach((header, i) => {
        obj[header] = linha[i];
      });

      return obj;

    });

}