export function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s]/g, " ") // deja solo letras/números/espacios
    .replace(/\s+/g, " ")
    .trim();
}

const sinonimos = {
  id: "diferencial",
  disyuntor: "diferencial",
  diferencial: "diferencial",
  tm: "termica",
  termomagnetica: "termica",
  termomagnética: "termica",
  tablero: "tablero",
  reacondicionar: "tablero",
};

export function reemplazarSinonimos(texto) {
  let palabras = texto.split(/\s+/);
  palabras = palabras.map((p) => (sinonimos[p] ? sinonimos[p] : p));
  return palabras.join(" ");
}

