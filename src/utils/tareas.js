export const tareasPredefinidas = [
    // 🔌 Tareas básicas

   {
  id: 400,
  nombre: "Boca",
  tipo: "paquete",
  incluye: [
    { id: 1, variante: "instalacion" }, // Tomacorriente completo
    { id: 50, cantidad: 6 },            // 6m cañería
    { id: 54, cantidad: 6 }             // 6m cableado
    
  ],
  ocultarSubtareas: true,
  descripcion: "Boca equivalente a tomacorriente instalación con 6m canalización"
}
,

    {
  id: 1,
  nombre: "Tomacorrientes",
  opciones: {
    instalacion: {
      tiempo: 20,
      multiplicador: 1.5,
      incluye: [
        { id: 61 },
        { id: 50 },
        { id: 53 },
        { id: 54 }
      ]
    },
    reemplazo: {
      tiempo: 20,
      multiplicador: 1.5
    }
  },
  variante: "reemplazo"
}
,
    
    { id: 2, nombre: "Interruptor simple",
        opciones: {
          instalacion: { tiempo: 15, multiplicador: 1.5, incluye: [ {id: 61}, { id: 50 }, { id: 53 }, { id: 54 } ] },
          reemplazo: { tiempo: 15, multiplicador: 1.5 } },
        variante: "reemplazo" },

    { id: 3, nombre: "Interruptor de combinacion",
        opciones: 
          { instalacion: { tiempo: 15, multiplicador: 1.7, incluye: [ {id: 61}, { id: 50 }, { id: 53 }, { id: 54 } ] },
          reemplazo: { tiempo: 15, multiplicador: 1.7 } },
        variante: "reemplazo" },

    /*{ id: 4, nombre: "Interruptor doble", opciones: {
      instalacion: { tiempo: 25, multiplicador: 2 },
      reemplazo: { tiempo: 18, multiplicador: 1.4 }
    }, variante: "instalacion" }, Caso 2 botones*/ 
    
      // ⚡ Protecciones y dispositivos 
    { id: 5, nombre: "Termica / Diferencial (2 polos)", tiempo: 15, multiplicador: 2.8 },
    { id: 6, nombre: "Termica / Diferencial (+2polos)", tiempo: 18, multiplicador: 3.5 },
    { id: 7, nombre: "Protector de tensión", tiempo: 15, multiplicador: 3.5 },
    { id: 8, nombre: "Contactor", tiempo: 15, multiplicador: 3.7 },
    { id: 9, nombre: "Instalacion de Jabalina", tiempo: 80, multiplicador: 3.2 },

    
    // 💡 Iluminación técnica y comercial
    { id: 30, nombre: "Artefacto LED", opciones: {
      instalacion: { tiempo: 20, multiplicador: 2.3 },
      reemplazo: { tiempo: 15, multiplicador: 1.5 }
    }, variante: "instalacion" },
    { id: 31, nombre: "Tiras LED", tiempo: 10, multiplicador: 1.5, unidad: "metro" },
    { id: 32, nombre: "Montaje de luminarias comerciales", tiempo: 20, multiplicador: 3.5, descripcion: "Incluye fijación y conexionado. No contempla automatismos ni estructuras adicionales." },
    { id: 33, nombre: "Montaje de TV", tiempo: 40, tipo: "calculada", requiereInput: true,
      descripcion: "Fijación segura en pared. El precio es un tercio del valor del equipo.", },
    { id: 34, nombre: "Reflector", opciones: {
      instalacion: { tiempo: 25, multiplicador: 2 },
      reemplazo: { tiempo: 18, multiplicador: 1.4 }
    }, variante: "instalacion" }, 

    // 🌀 Climatización y ventilación
    { id: 40, nombre: "Instalacion de ventilador de techo", tiempo: 80, multiplicador: 2.6 },
    { id: 41, nombre: "Instalación de aire acondicionado split", tiempo: 200, multiplicador: 3 },

    // 📦 Canalización y cableado
    { id: 50, nombre: "Instalación de cañería", tiempo: 5, multiplicador: 1.5, unidad: "metros", descripcion: "Fijación, nivelación y curvado de caños. No incluye el cableado." },
    { id: 51, nombre: "Instalación de bandeja portacables", tiempo: 8, multiplicador: 2.7, unidad: "metros" },
    { id: 52, nombre: "Tendido de cable sobre bandeja", tiempo: 4, multiplicador: 2.2, unidad: "metros",
      descripcion: "Tendido, organización y sujeción sobre bandeja. No incluye conexión de extremos ni rotulado." },
    { id: 53, nombre: "Colocacion de cajas", tiempo: 5, multiplicador: 1.5 },
    { id: 54, nombre: "Cableado",
      opciones: { "metros": { tiempo: 2, multiplicador: 1.5 }, "m²": { tiempo: 4, multiplicador: 0.7 }, "ambientes": { tiempo: 60, multiplicador: 1.1 }, },
      variante: "metros", descripcion: "Pasado de conductores (F, N y Pe) por cañeria sintetica o metalica." },
    { id: 55, nombre: "Tendido de cable subterráneo", tiempo: 6, multiplicador: 3.5, unidad: "metros", descripcion: "Incluye cama de arena, proteccion mecanica y señalización." },
    { id: 56, nombre: "Zanjeo para tendido subterráneo",
      opciones: { blando: { tiempo: 12, multiplicador: 1.5 }, duro:   { tiempo: 30, multiplicador: 1.15 } },
      variante: "blando", unidad: "metros", descripcion: "Zanja de 20x70cm." },


    // 🧠 Diagnóstico y planificación
    { id: 60, nombre: "Logistica compra de materiales", tiempo: 35, multiplicador: 1.5, unidad: "puntos de retiro", descripcion: "Incluye análisis de listado de materiales, armado de pedido y coordinación logística. No contempla fletes de traslados." },
    { id: 61, nombre: "Replanteo", /* tiempo: 20, multiplicador: 3.2, unidad: "ambientes"*/ 
      opciones: { "boca": { tiempo: 5, multiplicador: 1.5 }, "ambientes": { tiempo: 20, multiplicador: 3 }, },
      variante: "boca" },
    { id: 62, nombre: "Medición y diagnóstico", tiempo: 20, multiplicador: 2, unidad: "tableros", descripcion: "Evaluación de circuitos, protecciones y continuidad. No incluye resolución." },
    { id: 63, nombre: "Elaboración de planos unifilares", tiempo: 15, multiplicador: 1.4, unidad: "circuitos" },
    { id: 64, nombre: "Busqueda de fuga", tiempo: 90, multiplicador: 1.85, unidad: "circuitos" },
    { id: 65, nombre: "Busqueda cortocircuito", tiempo: 10, multiplicador: 1.85, unidad: "Cajas" },
    
    // ⚙️ Tableros
    { id: 70, nombre: "Instalacion de tablero en superficie", tiempo: 45, multiplicador: 1.5 },
    { id: 71, nombre: "Instalacion de tablero embutido", tiempo: 45, multiplicador: 2 },
    { id: 72, nombre: "Diseño de tablero", tiempo: 10, multiplicador: 1.8, unidad: "polos", descripcion: "Colocación y distribucion de los dispositivos, conexionado y prueba funcional." },
    { id: 73, nombre: "Reacondicionamiento de tablero", tiempo: 15, multiplicador: 4.5, unidad: "dispositivos", descripcion: "Organización de cables y dispositivos. No incluye reemplazo de protecciones." },
    
    //{ id: 73, nombre: "Tablero BEA (2 bombas M/A)", tiempo: 360, multiplicador: 3 },
              /*opciones: {
              "1 bomba simple": { tiempo: 120, multiplicador: 2.6 },
              "2 bombas automatico": { tiempo: 360, multiplicador: 3 }, 
      }, variante: "bomba simple"},
      
      { id: 140,
        nombre: "Reacondicionamiento de tablero de servicios generales",
        opciones: {
          unico: {
            tiempo: 60,
            multiplicador: 3.2,
            incluye: [
              { id: 62 }, // Medición y diagnóstico
              { id: 5, cantidad: 1 }, // Térmica/Diferencial (2 polos)
              { id: 130 }, // Reordenamiento de cableado
              { id: 63 } // Elaboración de planos
            ]
          }
        },
        variante: "unico"
      },
      */
    
    { id: 74, nombre: "Instalación de tablero BEA - 2 bombas M/A",
              tipo: "paquete",
              incluye: [
              { id: 70 }, // Instalación de tablero en superficie
              { id: 72, cantidad: 8 }, // Armado de tablero por polos (ejemplo: 2 térmicas, 2 contactores, 2 guardamotores, diferencial, relé)
              { id: 6 }, // Termica/Diferencial
              { id: 8 }, // Reemplazo de contactores (como referencia)
              { id: 80 }, // Sensor de movimiento (podés usarlo como base para presostato o relé de nivel)
              { id: 85 }, // Generar automatismo (programación de alternancia)
              { id: 61 }, // Medición y diagnóstico
              { id: 83 }  // Sistema de alarma (usamos sistema de alarma como referencia)
              ],
              resumen: {
              tiempo: 480,
              multiplicador: 3.6
              }
              },    

    // 🧠 Automatización y control
    { id: 80, nombre: "Sensor de movimiento", opciones: {
      instalacion: { tiempo: 30, multiplicador: 1.85 },
      reemplazo: { tiempo: 25, multiplicador: 1.5 }
    }, variante: "instalacion" },
    { id: 81, nombre: "Fotocélula", opciones: {
      instalacion: { tiempo: 30, multiplicador: 1.85 },
      reemplazo: { tiempo: 25, multiplicador: 1.5 }
    }, variante: "instalacion" },
    { id: 82, nombre: "Reemplazo de flotante", tiempo: 60, multiplicador: 1.2 },
    { id: 83, nombre: "Portero eléctrico", opciones: {
      instalacion: { tiempo: 150, multiplicador: 1.85 },
      reemplazo: { tiempo: 90, multiplicador: 1.3 }
    }, variante: "instalacion" },
    { id: 84, nombre: "Instalación de sistema de alarma", tiempo: 120, multiplicador: 1.85 },
    { id: 85, nombre: "Tareas industriales", tiempo: 90, multiplicador: 3 },
    { id: 86, nombre: "Generar automatismo", tiempo: 120, multiplicador: 2, descripcion: "Incluye lógica de control con relé, temporizador o fotocélula. No incluye programación PLC." },

    // 🚧 Intervenciones complejas
    { id: 90, nombre: "Fusibles NH", tiempo: 20, multiplicador: 3.5, descripcion: "Instalación en portafusibles existentes." },
    { id: 91, nombre: "Reparacion en toma primaria", tiempo: 120, multiplicador: 3, descripcion: "Intervención en punto de acometida. Puede requerir corte de tensión y aviso previo." },
    { id: 92, nombre: "Pilar monofasico", tiempo: 210, multiplicador: 3.2, descripcion:"No incluye albañileria" },
    { id: 93, nombre: "Pilar trifasico", tiempo: 240, multiplicador: 5, descripcion:"No incluye albañileria" },

    /*{ id: 92,
      nombre: "Pilar monofasico",
      opciones: {
        "sin-albañileria": { tiempo: 210, multiplicador: 3.0 },
        "con-albañileria": { tiempo: 270, multiplicador: 3.5 },
      },
      variante: "monofasico-sin-albañileria"
    },
    { id: 93,
      nombre: "Pilar trifasico",
      opciones: {
        "sin-albañileria": { tiempo: 270, multiplicador: 3.8 },
        "con-albañileria": { tiempo: 330, multiplicador: 4.2 },
      },
      variante: "monofasico-sin-albañileria"
    },*/
    
    // 📋 Tareas administrativas - AEA
    { id: 100, nombre: "DCI (Res.Enre 225/11 - 380/15)", tipo: "administrativa", descripcion: "Incluye documentacion y relevamiento. Valores sugeridos COPIME", opciones: {
        "Cat. 1": { valor: 200000 },
        "Cat. 2": { valor: 480000 },
        "Cat. 3": { valor: 1200000 }
      }, variante: "Cat. 1" },

/*  { id: 101, nombre: "Elaboración de documentación técnica", tipo: "administrativa", opciones: {
        "Cat. 1": { valor: 140000 },
        "Cat. 2": { valor: 336000 },
        "Cat. 3": { valor: 840000 }
      }, variante: "Cat. 1" },*/

    { id: 102, nombre: "Relevamiento de la instalación eléctrica", tipo: "administrativa", descripcion: "Cat 1: <10KVA- Cat 2: entre 10 y 50KVA - Cat 3: >50KVA (BT). Valores sugeridos COPIME", opciones: {
        "Cat. 1": { valor: 60000 },
        "Cat. 2": { valor: 144000 },
        "Cat. 3": { valor: 360000 }
      }, variante: "Cat. 1" },      

    { id: 106, nombre: "Medicion de Puesta a Tierra (T1-R)", tipo: "administrativa", valor: 160000 },

    {
  id: 300,
  nombre: "Tablero nuevo",
  tipo: "composicion",
  unidad: "polos",
  cantidad: 96,
  opciones: {
    "Diseño + armado": { porcentajeDiseno: 0.35, porcentajeArmado: 0.65 },
    "Solo diseño": { porcentajeDiseno: 0.35, porcentajeArmado: 0 },
    "Solo armado": { porcentajeDiseno: 0, porcentajeArmado: 0.65 }
  },
  variante: "Diseño + armado",
  descripcion: "Diseño técnico y/o armado físico del tablero según cantidad de polos.",
}

    
  ];