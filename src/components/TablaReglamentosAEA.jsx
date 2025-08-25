import { useState } from "react";

const documentosAEA = [
  { codigo: "GUIA AEA 770", edicion: "2018", detalle: "Instalaciones Eléctricas en Viviendas Unifamiliares hasta 10 Kw" },
  { codigo: "90364-0", edicion: "2006", detalle: "Guía de Aplicación" },
  { codigo: "90364-1", edicion: "2006", detalle: "Alcance, Objeto y Principios Fundamentales" },
  { codigo: "90364-2", edicion: "2006", detalle: "Definiciones" },
  { codigo: "90364-3", edicion: "2006", detalle: "Determinación de las carácterísticas Generales de las Instalaciones" },
  { codigo: "90364-4", edicion: "2006", detalle: "Protecciones para Preservar la Seguridad" },
  { codigo: "90364-5", edicion: "2006", detalle: "Elección e Instalación de los Materiales Eléctricos" },
  { codigo: "90364-6", edicion: "2021", detalle: "Verificación de las Instalaciones Eléctricas" },
  // ... podés seguir completando con todos los del documento
  { codigo: "90364-7-701", edicion: "2012", detalle: "Cuartos de baño" },
  { codigo: "90364-7-702", edicion: "2018", detalle: "Piscinas y fuentes ornamentales" },
  //{ codigo: "90364-7-703", edicion: "2016", detalle: "Prescripciones particulares - Sitios con riesgo de corrosión o humedad excesiva" },
  //{ codigo: "90364-7-704", edicion: "2016", detalle: "Prescripciones particulares - Sitios de construcción y demolición" },
  //{ codigo: "90364-7-705", edicion: "2016", detalle: "Prescripciones particulares - Instalaciones agrícolas y hortícolas" },
  //{ codigo: "90364-7-706", edicion: "2016", detalle: "Prescripciones particulares - Volúmenes conductores reducidos" },
  //{ codigo: "90364-7-708", edicion: "2016", detalle: "Prescripciones particulares - Campings y áreas para vehículos habitables" },
  //{ codigo: "90364-7-709", edicion: "2016", detalle: "Prescripciones particulares - Puertos deportivos" },
  { codigo: "90364-7-710", edicion: "2024", detalle: "Locales para usos medicos y salas externas a los mismos" },
  { codigo: "90364-7-711", edicion: "2021", detalle: "Instalaciones electricas en eventos" },
  { codigo: "90364-7-712", edicion: "2015", detalle: "Paneles fotovoltaicos" },
  //{ codigo: "90364-7-714", edicion: "2021", detalle: "Prescripciones particulares - Iluminación exterior" },
  //{ codigo: "90364-7-715", edicion: "2016", detalle: "Prescripciones particulares - Sistemas de distribución eléctrica a través de redes de distribución prefabricadas" },
  { codigo: "90364-7-718", edicion: "2008", detalle: "Lugares y locales de publica concurrencia" },
  { codigo: "90364-7-722", edicion: "2018", detalle: "Suministro a vehiculos electricos" },
  { codigo: "90364-7-770", edicion: "2017", detalle: "Viviendas unifamiliares (Hasta 63A - Clasificaciones BA2 y BD1)" },
  //{ codigo: "90364-7-753", edicion: "2016", detalle: "Prescripciones particulares - Sistemas de calefacción por cables o mantas calefactoras" },
  //{ codigo: "90364-7-754", edicion: "2016", detalle: "Prescripciones particulares - Sistemas de alimentación para seguridad" },
  { codigo: "90364-7-771", edicion: "2006", detalle: "Viviendas, oficinas y locales (unitarios)" },
  { codigo: "90364-7-772", edicion: "2019", detalle: "Instalaciones en espacios comunes y servicios generales en inmuebles colectivos" },
  { codigo: "90364-7-779", edicion: "2013", detalle: "Reglas particulares para las instalaciones en Lugares y Locales Especiales. Sección 779: Módulos de instalación concentrada, de electrificación mínima" },
  { codigo: "90364-7-780", edicion: "2011", detalle: "Automatización de Edificios" },
  { codigo: "90364-7-791-T1", edicion: "2018", detalle: "Instalaciones eléctricas para medios de transporte fijos de personas, animales domésticos y de cría y cargas en general. Tomo 1: Ascensores de pasajeros" },
  { codigo: "90364-7-791-T2", edicion: "2020", detalle: "Instalaciones eléctricas para medios de transporte fijos de personas, animales domésticos y de cría y cargas en general. Tomo 2: Escaleras mecánicas, rampas y andenes móviles, elevador vehicular, gira coches, rampa móvil vehicular, sillas y plataformas salva escaleras y montacargas" },
  { codigo: "90364-8", edicion: "2019", detalle: "Eficiencia Energética en la Instalaciones Eléctrica de Baja Tensión. Sección 1- Requisitos Generales de Eficiencia Energética" },
  { codigo: "60079-10-1", edicion: "2023", detalle: "Atmósferas Explosivas. Parte 10.- Clasificación de Áreas- Sec. 1 Atmósferas Gaseosas" },
  { codigo: "60079-10-2", edicion: "2023", detalle: "Atmósferas Explosivas. Parte 10.- Clasificación de Áreas- Sec. 1 Atmósferas de Polvo" },
  { codigo: "90079-14", edicion: "2012", detalle: "Atmósferas Explosivas. Parte 14.- Proyecto, Selección y Montaje en Instalaciones Eléctricas" },
  { codigo: "90079-17", edicion: "2013", detalle: "Atmósferas Explosivas. Parte 17.- Inspección y Mantenimiento" },
  
  { codigo: "60079-19", edicion: "2021", detalle: "Atmósferas Explosivas. Parte 19: Reparación, revisión y recuperación del material" },
  { codigo: "90479-1", edicion: "2020", detalle: "Efectos del paso de la corriente Eléctrica por el cuerpo humano y por los animales domésticos y de cría. Parte 1: Aspectos Generales" },
  { codigo: "90479-4", edicion: "2022", detalle: "Efectos del paso de la corriente eléctrica por el cuerpo humano y por los animales domésticos y de cría. Parte 4: Efectos de los rayos" },
  { codigo: "90479-5", edicion: "2019", detalle: "Efectos del paso de la corriente Eléctrica por el cuerpo humano y por los animales domésticos y de cría. Parte 5: Umbrales de tensión de contacto para efectos fisiológicos" },
  { codigo: "90706", edicion: "2006", detalle: "Guía para la Gestión del mantenimiento en Instalaciones" },
  { codigo: "90790", edicion: "2012", detalle: "Protección contra las descargas eléctricas atmosféricas en las estaciones de carga de combustible" },
  { codigo: "90865-1", edicion: "2016", detalle: "Corrientes de Cortocircuito. Cálculo de los Efectos" },
  { codigo: "90865-2", edicion: "2019", detalle: "Corrientes de Cortocircuito. Ejemplos de cálculo" },
  { codigo: "90890-1", edicion: "2017", detalle: "Método para la Verificación por cálculo del incremento de temperatura en tableros BT. Parte 1: Ventilación natural" },
  { codigo: "60909-0", edicion: "2021", detalle: "Corrientes de Corto Circuito en Sistemas Trifásicos de Corriente Alterna. Cálculo de las Corrientes" },
  { codigo: "90909-1", edicion: "2005", detalle: "Corrientes de Corto Circuito en Sistemas trifásicos de Corriente Alterna. Factores para el Cálculo" },
  { codigo: "91140", edicion: "2021", detalle: "Protección contra los Choques Eléctricos" },
  
  { codigo: "61201", edicion: "2021", detalle: "Uso de las tensiones límites convencionales de contacto" },
  { codigo: "91340-1", edicion: "2016", detalle: "Electroestática. Informe técnico - Parte 1: Fenomenos electroestáticos. Principios y Mediciones" },
  { codigo: "91340-4-1", edicion: "2020", detalle: "Electroestática: Resistencia eléctrica de la cobertura de pisos y de los pisos instalados" },
  { codigo: "92305-1", edicion: "2015", detalle: "Protección contra Rayos. Principios Generales" },
  { codigo: "92305-2", edicion: "2015", detalle: "Protección contra Rayos. Evaluación del Riesgo" },
  { codigo: "92305-3", edicion: "2015", detalle: "Protección contra Rayos. Daño físico a Estructuras y Riesgo Humano" },
  { codigo: "92305-4", edicion: "2015", detalle: "Protección contra Rayos. Sistema Eléctrico y Electrónico en Estructuras" },
  { codigo: "92305-11", edicion: "2016", detalle: "Protección contra Rayos. Parte 11.- Guía para la elección de protección cpmtra rayos para usar en le República Argentina" },
  { codigo: "92559-1", edicion: "2013", detalle: "Redes Eléctricas Inteligentes. Parte 1- Guía de conceptos, beneficios y desafíos para su implementación" },
  { codigo: "92559-2", edicion: "2019", detalle: "Redes Eléctricas Inteligentes. Parte 2. Sección 1: Definición del Modelo. Sección 2: Encuesta de Evaluación" },
  { codigo: "92559-3-1", edicion: "2019", detalle: "Redes Eléctricas Inteligentes. Parte 3 - Sistemas de Generación de Energía mediante Fuentes Renovables, conectadas a BT" },
  { codigo: "92606", edicion: "2023", detalle: "Arco Eléctrico. Cálculo de Magnitudes representativas de los efectos térmicos y su protección" },
  { codigo: "92713", edicion: "2022", detalle: "Procedimientos de seguridad para la reducción del riesgo por caída de rayos en el exterior de una estructura" },
  
  { codigo: "95101", edicion: "2015", detalle: "Líneas Subterráneas Exteriores de Energía y Telecomunicaciones" },
  { codigo: "95150", edicion: "2007", detalle: "Suministro y Medición en Baja Tensión" },
  { codigo: "95201", edicion: "2018", detalle: "Líneas Aéreas Exteriores de Baja Tensión" },
  { codigo: "95301", edicion: "2007", detalle: "Líneas Aéreas Exteriores de Media y Alta tensión" },
  { codigo: "95401", edicion: "2006", detalle: "Centros de Transformación y Suministro en Media Tensión" },
  { codigo: "95402", edicion: "2011", detalle: "Estaciones Transformadoras" },
  { codigo: "95403", edicion: "2018", detalle: "Ejecución de Instalaciones Eléctricas en Inmuebles de tensión nominal mayor a 1 kV y hasta 36 kV inclusive, en corriente alterna" },
  { codigo: "95501-2", edicion: "2021", detalle: "Reglamentación para la Puesta a Tierra de Sistemas Eléctricos AEA 95501 IRAM 2281. Parte 2: Guía de mediciones de magnitudes de puesta a tierra (resistividades, resistencias, impedancias y gradientes)" },
  { codigo: "95501-4", edicion: "2016", detalle: "Reglamentación para la Puesta a Tierra de Sistemas Eléctricos AEA 95501 IRAM 2281. Parte 4: Instalaciones con tensiones nominales mayores a 1 kV" },
  { codigo: "95501-8", edicion: "2016", detalle: "Reglamentación para la Puesta a Tierra de Sistemas Eléctricos AEA 95501 IRAM 2281. Parte 8: soportes y artefactos para uso eléctrico en la vía pública con tensiones nominales menores o iguales a 1kV" },
  { codigo: "95511", edicion: "2023", detalle: "Condiciones para la instalación de sistemas de alimentación ininterrumpida (UPS)" },
  { codigo: "95702", edicion: "2021", detalle: "Trabajos con Tensión en Instalaciones Eléctricas con Tensiones Mayores a 1kV" },
  { codigo: "95703", edicion: "2018", detalle: "Alumbrado Público" },
  { codigo: "95704", edicion: "2011", detalle: "Señalización de Instalaciones Eléctricas en la Vía Pública + Guía" },

  { codigo: "95705", edicion: "2013", detalle: "Ejecución de Trabajos con Tensión en Instalaciones Eléctricas de BT en C.C y C.A" },
];

export function TablaReglamentosAEA() {
  const [filtro, setFiltro] = useState("");

  const documentosFiltrados = documentosAEA.filter(
    (doc) =>
      doc.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      doc.edicion.includes(filtro) ||
      doc.detalle.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">📚 Indice de Reglamentos AEA</h2>

      <input
        type="text"
        placeholder="Buscar por código, año o titulo..."
        className="w-full p-3 border rounded mb-6"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <div className="max-h-[500px] overflow-y-auto border rounded-xl shadow">
        <table className="w-full table-auto border-collapse bg-white shadow rounded-xl">
          <thead className="bg-blue-800 text-white sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Código</th>
              <th className="p-3 text-left">Edición</th>
              <th className="p-3 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {documentosFiltrados.map((doc, index) => (
              <tr key={index} className="border-t hover:bg-blue-50">
                <td className="p-3 font-mono">{doc.codigo}</td>
                <td className="p-3">{doc.edicion}</td>
                <td className="p-3">{doc.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Comunicate con los sitios oficiales de AEA para adquirir la reglamentacion correspondiente.
      </p>
    </section>
  );
}
