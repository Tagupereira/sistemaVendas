await fetch(URL, {
   method: "POST",
   body: JSON.stringify({
      id: Date.now(),
      produto: "Mouse",
      estoque: 10
   })
});

// select
const dados =
await fetch(URL);

const json =
await dados.json();

console.log(json);

// insert
await fetch(URL, {
   method: "POST",
   body: JSON.stringify({
      id: Date.now(),
      produto: "Mouse",
      estoque: 10
   })
});

// remover ou alterar
sheet.getRange(linha, coluna)


// id	nome	id_categoria	preco	estoque	status	tipo_de_venda	id_variacao	id_cliente

Primária: #2563EB    (Blue 600)
Primária Hover: #1D4ED8

Texto Principal: #0F172A
Texto Secundário: #64748B

Background: #FFFFFF
Background Secundário: #F8FAFC

Bordas: #E2E8F0