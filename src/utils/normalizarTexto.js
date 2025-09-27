export function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s]/g, " ") // deja solo letras/números/espacios
    .replace(/\s+/g, " ")
    .trim();
}

const diccionario = {
  "termo magnética": "tm",
  "termomagnetica": "tm",
  "id": "disyuntor diferencial",
  "disyuntor": "disyuntor diferencial",
  "tablero": "tablero electrico",
};

export function reemplazarSinonimos(texto) {
  let salida = texto;
  for (const [clave, valor] of Object.entries(diccionario)) {
    const regex = new RegExp("\\b" + clave + "\\b", "gi");
    salida = salida.replace(regex, valor);
  }
  return salida;
}
