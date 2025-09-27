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
    nombre: "Reemplazo de lámpara",
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
    nombre: "Tablero 8 polos",
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
    descripcion: "",
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

  // 🔌 4) ADMINISTRATIVAS
  { id: 50, nombre: "DCI", tipo: "administrativa", descripcion: "", opciones: {
          "Monofasico": { valor: 305000 },
          "Trifasico": { valor: 460000 },          
        }, variante: "Monofasico",
  
     nivel: 2
  },

  { id: 51, nombre: "Relevamiento de la instalación eléctrica", tipo: "administrativa", descripcion: "Cat 1: <10KVA- Cat 2: entre 10 y 50KVA - Cat 3: >50KVA (BT).", opciones: {
          "Cat. 1": { valor: 60000 },
          "Cat. 2": { valor: 144000 },
          "Cat. 3": { valor: 360000 }
        }, variante: "Cat. 1",
    nivel: 3
  },      

  { id: 52, nombre: "Medicion de Puesta a Tierra (T1-R)", tipo: "administrativa", valor: 160000, 
    nivel: 2 },
  { id: 53, nombre: "Puesta en servicio / pruebas / medicion", tipo: "administrativa", valor: 100000, descripcion: "Pruebas finales de funcionamiento, verificación de protecciones y seguridad, mediciones eléctricas, continuidad, aislamiento, corrientes de fuga.", 
    nivel: 1 },
  { id: 54, nombre: "Balanceo de cargas trifásicas", tipo: "administrativa", valor: 360000, descripcion: "Medición y redistribución de circuitos en fases para mejorar balance trifásico.",
    nivel: 2 },
  { id: 55, nombre: "Memoria tecnica", tipo: "administrativa", valor: 300000, descripcion: "Redacción de informe técnico de acuerdo a reglamentaciones vigentes.",
    nivel: 2 },
  { id: 56, nombre: "Informe termografico", tipo: "administrativa", valor: 250000, descripcion: "Relevamiento termográfico de tableros o instalaciones eléctricas.", 
    nivel: 2 },

  // 🔌 5) CALCULADAS
  {
    id: 60,
    nombre: "Montaje de TV",
    tiempo: 40,
    tipo: "calculada",
    requiereInput: true,
    opciones: {
      "Grande": { porcentaje: 27 },
      "Pequeño": { porcentaje: 20 }
    },
    nivel: 2
  } 

];
