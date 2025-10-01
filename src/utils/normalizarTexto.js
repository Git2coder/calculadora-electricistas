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
  itm: "termica",
  pia: "termica",
  proteccion: "termica",
  termomagnetica: "termica",
  termomagnetico: "termica",
  termomagnética: "termica",
  tablero: "tablero",
  tp: "tablero",
  ts: "tablero",
  reacondicionar: "tablero",
  adecuacion: "tablero",
  electrodo: "Jababalina",
  dispersion: "Jababalina",
  tomas: "tomacorrientes",
  enchufes: "tomacorrientes",
  enchufe: "tomacorrientes",
  tecla: "punto de luz",
  teclas: "punto de luz",
  pat: "puesta, jabalina",
  tramo: "tendido, caño",
  canalizacion: "tendido, caño",
  nh: "fusible",
  medidor: "pilar",
  dci: "certificado",
  fuga: "falla",
  corto: "falla",
  cortocircuito: "falla",
  salta: "falla",
  dispara: "falla",
  abre: "falla",
  romper: "boca",
  amurar: "caños",
  luminaria: "spot, lampara",
  tv: "montaje de tv",
  tele: "montaje de tv",
  televisor: "montaje de tv",
  smart: "montaje de tv",
};

export function reemplazarSinonimos(texto) {
  let palabras = texto.split(/\s+/);
  palabras = palabras.map((p) => (sinonimos[p] ? sinonimos[p] : p));
  return palabras.join(" ");
}

