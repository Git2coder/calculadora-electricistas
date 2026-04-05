// src/utils/tareas.js

/**
 * 🔹 Definición de tareas predefinidas
 *
 * TIPOS DE TAREA SOPORTADOS:
 * 1. Base                  → Ej: Boca. Sirve como referencia.
 * 2. Simple dependiente    → Ej: Aplique, Tira LED. Calculadas con factor sobre la base.
 * 3. Simple con opciones   → Ej: Tomacorriente. Distintas variantes (instalación / reemplazo).
 * 4. Administrativa        → Ej: DCI, Relevamiento, Medición puesta a tierra.
 * 5. Calculada             → Ej: Montaje de TV. Basadas en inputs/porcentajes.
 */

export const tareasPredefinidas = [

    // 🔌 1) BASE
  {
    id: 0,
    nombre: "Boca",
    tiempo: 60,              
    multiplicador: 2.5,        
    tipo: "base",            // para utilizar como referencia
    nivel: 1
  },

  // 🔌 2) SIMPLES DEPENDIENTES DE BOCA
  {
    id: 10,
    nombre: "Busqueda de falla",
    tiempo: 60, 
    unidad: "Circuitos",             
    dependeDe: "Boca",
    factorBoca: 1,          
    nivel: 1
  },    
  {
    id: 11,
    nombre: "Termica / Diferencial (2P)",
    tiempo: 10,              
    dependeDe: "Boca",
    factorBoca: 0.75,          
    nivel: 1
  },
  {
    id: 12,
    nombre: "Termica / Diferencial (>2P)",
    tiempo: 20,              
    dependeDe: "Boca",
    factorBoca: 1.5,          
    nivel: 1
  },
  {
    id: 13,
    nombre: "Protector de tension (2P)",
    tiempo: 15,              
    dependeDe: "Boca",
    factorBoca: 0.75,          
    nivel: 1
  },
  {
    id: 14,
    nombre: "Contactor",
    tiempo: 18,              
    dependeDe: "Boca",
    factorBoca: 1.7,          
    nivel: 1
  },  
  {
    id: 15,
    nombre: "Jabalina de proteccion",
    tiempo: 80,              
    dependeDe: "Boca",
    factorBoca: 1.9,          
    nivel: 1
},
  {
    id: 16,
    nombre: "Aplique simple",
    tiempo: 20,              
    dependeDe: "Boca",
    factorBoca: 0.35,          
    nivel: 1
  },
  {
    id: 17,
    nombre: "Spot LED",
    tiempo: 20,              
    dependeDe: "Boca",
    factorBoca: 0.35,          
    nivel: 1
},
  {
    id: 18,
    nombre: "Tiras LED",
    tiempo: 20,              
    dependeDe: "Boca",
    factorBoca: 0.35,          
    nivel: 1
  },
  {
    id: 19,
    nombre: "Reflector",
    tiempo: 35,              
    dependeDe: "Boca",
    factorBoca: 0.45,          
    nivel: 1
  },    
  {
    id: 20,
    nombre: "Artefacto colgante liviano",
    tiempo: 35,              
    dependeDe: "Boca",
    factorBoca: 0.75,          
    nivel: 1
  },
  {
    id: 21,
    nombre: "Artefacto colgante pesado",
    tiempo: 55,              
    dependeDe: "Boca",
    factorBoca: 1.5,          
    nivel: 1
  },
  {
    id: 22,
    nombre: "Equipo tubo led",
    tiempo: 30,              
    dependeDe: "Boca",
    factorBoca: 0.7,          
    nivel: 1
  },
  {
    id: 23,
    nombre: "Ventilador techo c/ luminaria",
    tiempo: 55,              
    dependeDe: "Boca",
    factorBoca: 1.5,          
    nivel: 1
  },
  {
    id: 24,
    nombre: "Caño corrugado",
    unidad: "metros",        
    tiempo: 3,     
    dependeDe: "Boca",
    factorBoca: 0.06,  
    nivel: 1
  },
  {
    id: 25,
    nombre: "Caja de paso",
    dependeDe: "Boca",
    factorBoca: 0.1,   
    tiempo: 5,
    descripcion: "Colocar caja de paso intermedia para canalización y cableado.",
    nivel: 1
  },
  {
    id: 26,
    nombre: "Farola de parque",
    dependeDe: "Boca",
    factorBoca: 0.85, 
    tiempo: 45,
    descripcion: "Colocación de farola de parque con conexión eléctrica.",
    nivel: 1
  },

  {
    id: 27,
    nombre: "Tendido cable por bandeja",
    tiempo: 3.5, 
    unidad: "metros",             
    dependeDe: "Boca",
    factorBoca: 0.13,    
    descripcion: "Tendido, organización y sujeción sobre bandeja.",      
    nivel: 1
  },        
  {
    id: 28,
    nombre: "Montaje tablero superficie",
    tiempo: 15,          
    dependeDe: "Boca",
    factorBoca: 0.35,          
    nivel: 1
  },    
  {
    id: 29,
    nombre: "Montaje tablero embutido",
    tiempo: 45,          
    dependeDe: "Boca",
    factorBoca: 0.75,          
    nivel: 1
  },    
   {
    id: 30,
    nombre: "Tablero bombas elevadoras de agua",
    dependeDe: "Boca",
    opciones: {
      "1B-Básico": { factorBoca: 5.0, tiempo: 180 },
      "2B-Alternancia": { factorBoca: 8.0, tiempo: 300 },
      "2B-Alt + Alarma": { factorBoca: 10.0, tiempo: 360 },
      "2B-Completo": { factorBoca: 12.0, tiempo: 420 }
    },
    variante: "1B-Básico",
    descripcion: "Básico: 1 bomba automática. Alternancia: 2 bombas con lógica de alternancia. Alt + Alarma: alternancia con alarma local. Completo: alternancia con alarma sonora/luminosa y contactos de aviso.",
    nivel: 3
  },
  {
    id: 31,
    nombre: "Sensor de movimiento",
    tiempo: 20,              
    dependeDe: "Boca",
    factorBoca: 0.35,          
    nivel: 1
},
  {
    id: 32,
    nombre: "Fotocelula",
    tiempo: 20,              
    dependeDe: "Boca",
    factorBoca: 0.35,          
    nivel: 1
},
  {
    id: 33,
    nombre: "Reemplazo de flotante",
    tiempo: 30,              
    dependeDe: "Boca",
    factorBoca: 0.7,          
    nivel: 1
  },
  {
    id: 34,
    nombre: "Reemplazo de lampara",
    dependeDe: "Boca",
    factorBoca: 0.12, 
    tiempo: 6,
    descripcion: "Cambio de lámpara. contemplar: altura, escaleras, etc.",
    nivel: 1
  },
  {
    id: 35,
    nombre: "Reemplazo fusible NH",
    tiempo: 20,          
    dependeDe: "Boca",
    factorBoca: 1,          
    nivel: 1
  },   
  {
    id: 36,
    nombre: "Reparacion en toma primaria",
    tiempo: 20,          
    dependeDe: "Boca",
    factorBoca: 2.4,          
    nivel: 2
  },   
  {
    id: 37,
    nombre: "Pilar completo",
    tiempo: 240,          
    dependeDe: "Boca",
    factorBoca: 9,          
    nivel: 2
  },   
 {
    id: 38,
    nombre: "Tablero 12 polos",
    unidad: "Tableros",
    dependeDe: "Boca",
    factorBoca: 3, 
    tiempo: 80,
    descripcion: "Montaje de tablero seccional hasta 8 polos.",
    nivel: 1
  },
  {
    id: 39,
    nombre: "Circuito independiente",
    unidad: "m",
    dependeDe: "Boca",
    factorBoca: 0.2, 
    tiempo: 7, 
    descripcion: "Ejecución de un nuevo circuito independiente desde tablero.",
    nivel: 1
  },
  {
    id: 40,
    nombre: "PLC pequeño",
    dependeDe: "Boca",
    factorBoca: 5.5, 
    tiempo: 240,
    descripcion: "Montaje y cableado de PLC pequeño para automatización básica.",
    nivel: 3
  },

  {
    id: 41,
    nombre: "Variador de frecuencia",
    dependeDe: "Boca",
    factorBoca: 5.95, 
    tiempo: 180,
    descripcion: "Montaje, conexionado y puesta en marcha de variador de frecuencia.",
    nivel: 2
  },

  {
    id: 42,
    nombre: "Arranque estrella-triángulo",
    dependeDe: "Boca",
    factorBoca: 5.5,
    tiempo: 240,
    descripcion: "Montaje de dispositivos en tablero para arranque estrella-triángulo de motor trifásico.",
    nivel: 2
  },

  {
    id: 43,
    nombre: "Arranque directo motor trifásico",
    dependeDe: "Boca", 
    factorBoca: 3.0, 
    tiempo: 120,
    descripcion: "Montaje de disposituvos en tablero para arranque directo de motor trifásico.",
    nivel: 1
  },
  {
    id: 44,
    nombre: "Cableado de sensores industriales",
    unidad: "m",
    dependeDe: "Boca",
    factorBoca: 0.85, 
    tiempo: 45,
    descripcion: "Cableado y conexionado de sensores de automatización industrial.",
    nivel: 2
  },
  {
    id: 45,
    nombre: "Cargador para auto eléctrico",
    dependeDe: "Boca",
    factorBoca: 6.0,
    tiempo: 300,
    descripcion: "Montaje y conexionado de cargador para vehículo eléctrico.",
    nivel: 3
  },
  {
    id: 46,
    nombre: "Caja moldeada",
    tiempo: 90,              
    dependeDe: "Boca",
    factorBoca: 2.5,          
    nivel: 2
  },

  // --- 47 Relevamiento y diagnóstico de instalación empotrada
  {
    id: 47,
    nombre: "Relevamiento y diagnóstico de instalación empotrada",
    dependeDe: "Boca",
    unidad: "bocas",
    factorBoca: 0.1,    // por ambiente. Trabajo técnico: destape, análisis, trazado mental del circuito.
    tiempo: 10,         // estimado por ambiente
    descripcion: "Destape de bocas, análisis de canalizaciones existentes, reconocimiento de distribución de circuitos y evaluación de factibilidad de modificaciones.",
    nivel: 2
  },

  // --- 48 Replanteo eléctrico con láser y chocla
  {
    id: 48,
    nombre: "Replanteo eléctrico",
    dependeDe: "Boca",
    unidad: "bocas",
    factorBoca: 0.1,    // marcación, nivelación, definición estética. Suele tomar 30–60 min.
    tiempo: 10,
    descripcion: "Marcado de líneas, alturas y recorridos usando láser nivelante y chocla. Incluye definición de posiciones de cajas nuevas.",
    nivel: 2
  },

  // --- 49 Rastreos y canaletas nuevas en muros
  {
    id: 49,
    nombre: "Rastreos y canaletas nuevas",
    dependeDe: "Boca",
    unidad: "m",
    factorBoca: 0.15,  // por metro. Trabajo físico, ruido, polvo. Es de las tareas más demandantes.
    tiempo: 15,
    descripcion: "Apertura de canaletas nuevas en muros para nuevas rutas de cañería.",
    nivel: 2
  },

  // --- 70 Roturas puntuales de acceso o liberación de caños
  {
    id: 70,
    nombre: "Roturas puntuales de acceso",
    dependeDe: "Boca",
    unidad: "intervenciones",
    factorBoca: 0.65,   // cada rotura chica lleva tiempo, decisión y reparación previa al punteo
    tiempo: 45,
    descripcion: "Roturas localizadas para liberar tramos de caño, acceder a cajas, corregir obstrucciones o generar acceso puntual.",
    nivel: 2
  },

  // --- 71 Instalación de cañería embutida con punteo
  {
    id: 71,
    nombre: "Instalación de cañería embutida (con punteo)",
    dependeDe: "Boca",
    unidad: "m",
    factorBoca: 0.1,   // por metro instalado, incluye curvas, fijación, alineación y punteo
    tiempo: 10,
    descripcion: "Colocación de caño corrugado o sintético en canaletas nuevas, con fijación por punteo. No incluye tapado ni revoque.",
    nivel: 1
  },

  // --- 72 Instalación de caja embutida con conexión a cañería
  {
    id: 72,
    nombre: "Instalación de caja embutida con conexión a cañería",
    dependeDe: "Boca",
    unidad: "punto",
    factorBoca: 1.4,   // correcta equivalencia: abrir hueco + fijar + conectar caño
    tiempo: 25,
    descripcion: "Instalación de caja embutida, apertura del hueco, fijación, alineación y conexión de la nueva cañería al sistema existente. Incluye punteo inicial.",
    nivel: 2
  },

  // --- 73 Reemplazo de tablero embutido
  {
    id: 73,
    nombre: "Reemplazo de tablero embutido",
    dependeDe: "Boca",
    unidad: "tablero",
    variante: "Hasta 12 polos",
    opciones: {
      "Hasta 12 polos": { factorBoca: 3.5, tiempo: 120 },
      "24 polos": { factorBoca: 5.0, tiempo: 150 },
      "48 polos": { factorBoca: 7.0, tiempo: 180 },
    },
    descripcion: "Reemplazo del gabinete del tablero embutido. Incluye retiro del tablero existente, adecuación del hueco, fijación del nuevo gabinete y reorganización interna básica.",
    nivel: 3
  },

  // --- 74 Acomodamiento interno del tablero existente
  {
    id: 74,
    nombre: "Acomodamiento interno del tablero existente",
    dependeDe: "Boca",
    unidad: "tablero",
    variante: "Hasta 12 polos",
    opciones: {
      "Hasta 12 polos": { factorBoca: 1.5, tiempo: 75 },
      "24 polos": { factorBoca: 2.2, tiempo: 95 },
      "48 polos": { factorBoca: 3.0, tiempo: 130 },
      "72 polos o más": { factorBoca: 4.5, tiempo: 300 }
    },
    descripcion: "Reordenamiento y adecuación de protecciones dentro del tablero existente, sin reemplazo del gabinete.",
    nivel: 2
  },

  // --- 75 Resolución de imprevistos ocultos
  {
    id: 75,
    nombre: "Resolución de imprevistos ocultos",
    dependeDe: "Boca",
    unidad: "intervenciones",
    factorBoca: 0.5,   // problemas típicos: caño tapado, codo muerto, doble muro, caja colapsada
    tiempo: 60,
    descripcion: "Corrección de situaciones inesperadas: cañerías tapadas o rotas, obstrucciones, desvíos obligados, cajas deterioradas o inaccesibles.",
    nivel: 2
  },

  // 🔌 3) SIMPLES CON OPCIONES
  {
    id: 1,
    nombre: "Tomacorriente",
    dependeDe: "Boca",
    opciones: {
      instalacion: { factorBoca: 1, tiempo: 50 },
      reemplazo: { factorBoca: 0.2, tiempo: 12 },
    }, variante: "instalacion",
    nivel: 1
  },
  {
    id: 2,
    nombre: "Punto de luz",
    dependeDe: "Boca",
    opciones: {
      instalacion: { factorBoca: 0.85, tiempo: 45 },
      reemplazo: { factorBoca: 0.2, tiempo: 12 },
    }, variante: "instalacion",
    nivel: 1
  },
  {
    id: 3,
    nombre: "Tendido de conductores hasta la boca (5 m)",
    unidad: "Boca",
    dependeDe: "Boca",
    opciones: {
      "Obra nueva": { factorBoca: 0.20, tiempo: 7.5 },
      "Recableado": { factorBoca: 0.35, tiempo: 15 }
    },
    variante: "Obra nueva",
    descripcion: "Solo incluye el tendido de conductores en canalización existente, hasta 5 m por boca. No incluye instalación de cañería, caja ni aparato.",
    nivel: 1
  },
  
  {
    id: 4,
    nombre: "Caño sintético - semirrigido",
    unidad: "metros",             
    dependeDe: "Boca",
    opciones: {
        "A la vista": { factorBoca: 0.08, tiempo: 5, },
        "Embutido": { factorBoca: 0.12, tiempo: 10, },          
      },
    variante: "A la vista",
    nivel: 1
  },
  {
    id: 5,
    nombre: "Caño metálico",
    unidad: "metros",             
    dependeDe: "Boca",
    opciones: {
        "A la vista": { factorBoca: 0.12, tiempo: 6 },
        "Embutido": { factorBoca: 0.15, tiempo: 12 }
      },
    variante: "A la vista",
    descripcion: "Colocación de cañerías metálicas en distintas variantes",
    nivel: 1
  },
  {
    id: 6,
    nombre: "Bandeja portacables",
    unidad: "metros",           
    dependeDe: "Boca",
    opciones: {
        "<= 150mm": { factorBoca: 0.24, tiempo: 12 },
        "de 200mm a 300mm": { factorBoca: 0.28, tiempo: 13 },
        "de 450mm a 600mm": { factorBoca: 0.36, tiempo: 14 }
      },
    variante: "<= 150mm",
    nivel: 1
  },
  {
    id: 7,
    nombre: "Tendido de cable subterráneo",
    unidad: "metros",
    dependeDe: "Boca",
    opciones: {
      "Con zanjeo y cañería": { factorBoca: 0.6, tiempo: 35 },
      "Con zanjeo y sin cañería": { factorBoca: 0.40, tiempo: 20 }
    },
    variante: "Con zanjeo y cañería",
    descripcion: "Excavación y tendido subterráneo. La opción con cañería incluye colocación de caño/corrugado, tendido de conductores y relleno. La opción sin cañería contempla tendido directo del cable con cama de arena/protección y relleno.",
    nivel: 2
  },
  // --- 8 Reemplazo de circuito terminal
  {
    id: 8,
    nombre: "Reemplazo de circuito terminal",
    dependeDe: "Boca",         // precio: baseBoca * factorBoca * cantidad
    unidad: "circuitos",       // input: cantidad de circuitos a recablear (1,2,...)
    opciones: {
      "Corto (≤ 20 m)": { factorBoca: 2, tiempo: 180 },   // factorBoca relativo a una Boca
      "Intermedio (20-40 m)": { factorBoca: 2.8, tiempo: 300 },
      "Largo (> 40 m)": { factorBoca: 3.6, tiempo: 420 }
    },
    variante: "Corto (≤ 20 m)",
    descripcion: "Recableado completo de un circuito desde el tablero seccional hasta la última boca. Incluye retiro de cable viejo, paso por cajas existentes, pruebas y etiquetado. Precio calculado por 'recorrido' (cantidad de circuitos). Tiempo solo para estimado.",
    nivel: 2
  },

  // --- 9 Reemplazo de línea seccional (depende de Boca)
  {
    id: 9,
    nombre: "Reemplazo de línea seccional",
    dependeDe: "Boca",        // mantiene la misma lógica de cálculo (base * factorBoca * cantidad)
    opciones: {      
      "Montante (≤ 5 pisos)": { factorBoca: 2.2, tiempo: 60 },             // factor por metro (más esfuerzo)
      "Montante (> 5 pisos / difícil)": { factorBoca: 3, tiempo: 120 }
    },
    variante: "Canalización accesible",
    descripcion: "Reemplazo o instalación de la seccional que alimenta al tablero del departamento. Se cobra por metro y se ajusta según accesibilidad/altura. El precio resultará de baseBoca * factorBoca * metros. Tiempo por metro para estimado.",
    nivel: 3
  },

  // 🔌 4) ADMINISTRATIVAS
  {
    id: 50,
    nombre: "Certificado DCI",
    tipo: "administrativa",
    opciones: {
      "Monofasico": { factorJornal: 5 },
      "Trifasico": { factorJornal: 7 }
    },
    variante: "Monofasico",
    nivel: 1
  },
  {
    id: 51,
    nombre: "Relevamiento de la instalación eléctrica",
    tipo: "administrativa",
    opciones: {
      "Cat. 1": { factorJornal: 1.3 },
      "Cat. 2": { factorJornal: 3 },
      "Cat. 3": { factorJornal: 7.2 }
    },
    variante: "Cat. 1",
    nivel: 3
  },
  { 
    id: 52, 
    nombre: "Medicion de Puesta a Tierra (T1-R)", 
    tipo: "administrativa", 
    factorJornal: 3.9, // Ejemplo: vale 2 jornales de oficial
    nivel: 1
  },
  { 
    id: 53, 
    nombre: "Impedancia de bucle / RCD", 
    tipo: "administrativa", 
    factorJornal: 1.2, 
    nivel: 2
  },
  { 
    id: 54, 
    nombre: "Balanceo de cargas trifásicas", 
    tipo: "administrativa", 
    factorJornal: 6.0, 
    nivel: 3,
    descripcion: "Medición y redistribución de circuitos en fases para mejorar balance trifásico."
  },
  { 
    id: 55, 
    nombre: "Memoria tecnica", 
    tipo: "administrativa", 
    factorJornal: 4.8, 
    nivel: 2,
    descripcion: "Redacción de informe técnico de acuerdo a reglamentaciones vigentes."
  },
  { 
    id: 56, 
    nombre: "Informe termografico", 
    tipo: "administrativa", 
    factorJornal: 4.3, 
    nivel: 2,
    descripcion: "Relevamiento termográfico de tableros o instalaciones eléctricas."
  },

  // 🔌 5) CALCULADAS
  {
    id: 60,
    nombre: "Montaje de TV",
    tiempo: 45,
    tipo: "calculada",
    requiereInput: true,
    opciones: {
      "Grande": { porcentaje: 27 },
      "Pequeño": { porcentaje: 20 }
    },
    nivel: 2
  } 

];


export const catalogoTareas = {

categorias: [

{
id: "electricidad_domestica",
nombre: "Electricidad del hogar",
icono: "⚡",

subcategorias: [

{
id: "enchufes_interruptores",
nombre: "Enchufes e interruptores",

tareas: [
"Tomacorriente",
"Punto de luz"
]
},

{
id: "Fallas",
nombre: "Fallas",

tareas: [
"Busqueda de falla",
]
},

{
id: "iluminacion",
nombre: "Iluminación",

tareas: [
"Aplique simple",
"Spot LED",
"Tiras LED",
"Reflector",
"Farola de parque",
"Artefacto colgante liviano",
"Artefacto colgante pesado",
"Equipo tubo led",
"Reemplazo de lampara"
]
},

{
id: "Electrodomestico",
nombre: "Electrodomestico",

tareas: [
"Ventilador techo c/ luminaria",
"Montaje de TV"
]
},

{
id: "automatizacion_luces",
nombre: "Sensores",

tareas: [
"Sensor de movimiento",
"Fotocelula",
"Reemplazo de flotante"
]
}

]
},

{
id: "tableros_protecciones",
nombre: "Tableros y protecciones",
icono: "🧰",

subcategorias: [

{
id: "protecciones",
nombre: "Dispositivo de proteccion",

tareas: [
"Termica / Diferencial (2P)",
"Termica / Diferencial (>2P)",
"Protector de tension (2P)",
"Caja moldeada",
"Jabalina de proteccion",
"Reemplazo fusible NH"
]
},
{
id: "maniobras",
nombre: "Dispositivo de maniobra",

tareas: [
"Contactor"
]
},
{
id: "tableros",
nombre: "Tableros eléctricos",

tareas: [
"Montaje tablero superficie",
"Montaje tablero embutido",
"Reemplazo de tablero embutido",
"Acomodamiento interno del tablero existente",
"Tablero 12 polos"
]
}

]
},

{
id: "canalizaciones_cableado",
nombre: "Canalizaciones y cableado",
icono: "🧵",

subcategorias: [

{
id: "canerias",
nombre: "Caños y bandejas",

tareas: [
"Caño corrugado",
"Caño sintético - semirrigido",
"Caño metálico",
"Bandeja portacables",
]
},

{
id: "tendido_cables",
nombre: "Tendido de cables",

tareas: [
"Tendido de conductores hasta la boca (5 m)",
"Tendido cable por bandeja",
"Tendido de cable subterráneo",
"Reemplazo de circuito terminal",
"Reemplazo de línea seccional",
]
}

]
},

{
id: "obra_electrica",
nombre: "Instalación eléctrica completa",
icono: "🏗️",

subcategorias: [

{
id: "muros_canos",
nombre: "muros y cañerías",

tareas: [
"Boca",
"Instalación de caja embutida con conexión a cañería",
"Instalación de cañería embutida (con punteo)",
"Rastreos y canaletas nuevas",
"Roturas puntuales de acceso",
"Pilar completo",
]
},

{
id: "diagnostico",
nombre: "Diagnóstico de instalación",

tareas: [
"Relevamiento y diagnóstico de instalación empotrada",
"Replanteo eléctrico",
"Imprevistos ocultos",
]
}

]
},

{
id: "automatizacion_industrial",
nombre: "Automatización e industria",
icono: "⚙️",

subcategorias: [

{
id: "motores",
nombre: "Motores eléctricos",

tareas: [
"Arranque directo motor trifásico",
"Arranque estrella-triángulo",
"Variador de frecuencia"
]
},

{
id: "control",
nombre: "Control y automatización",

tareas: [
"PLC pequeño",
"Tablero bombas elevadoras de agua"
]
}

]
},

{
id: "servicios_tecnicos",
nombre: "Servicios técnicos",
icono: "📟",

subcategorias: [

{
id: "certificaciones",
nombre: "Certificados",

tareas: [
"Certificado DCI"
]
},

{
id: "informes",
nombre: "Informes técnicos",

tareas: [
"Memoria tecnica",
"Informe termografico",
"Relevamiento de la instalación eléctrica"
]
},

{
id: "mediciones",
nombre: "Mediciones",

tareas: [
"Medicion de Puesta a Tierra (T1-R)",
"Impedancia de bucle / RCD",
"Balanceo de cargas trifásicas"
]
},

{
id: "Reparacion",
nombre: "Reparacion",

tareas: [
"Reparacion en toma primaria",

]
}
]
},

]

}