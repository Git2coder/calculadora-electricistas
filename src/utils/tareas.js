export const tareasPredefinidas = [
    // 🔌 Tareas básicas
  {
  id: 0,
  nombre: "Boca",
  tiempo: 60,              
  multiplicador: 2.5,        
  tipo: "base",            // para utilizar como referencia
},
{
  id: 1,
  nombre: "Tomacorriente",
  dependeDe: "Boca",
  opciones: {
    instalacion: { factorBoca: 1, tiempo: 50 },
    reemplazo: { factorBoca: 0.2, tiempo: 12 },
  }, variante: "instalacion"
},
{
  id: 2,
  nombre: "Punto de luz",
  dependeDe: "Boca",
  opciones: {
    instalacion: { factorBoca: 0.85, tiempo: 45 },
    reemplazo: { factorBoca: 0.2, tiempo: 12 },
  }, variante: "instalacion"
},
{
  id: 3,
  nombre: "Busqueda de falla",
  tiempo: 60, 
  unidad: "Circuitos",             
  dependeDe: "Boca",
  factorBoca: 1,          
},    

     // ⚡ Protecciones y dispositivos 
    {
  id: 5,
  nombre: "Termica / Diferencial (2P)",
  tiempo: 10,              
  dependeDe: "Boca",
  factorBoca: 0.75,          
},
     {
  id: 6,
  nombre: "Termica / Diferencial (>2P)",
  tiempo: 20,              
  dependeDe: "Boca",
  factorBoca: 1.5,          
},
     {
  id: 7,
  nombre: "Protector de tension (2P)",
  tiempo: 15,              
  dependeDe: "Boca",
  factorBoca: 0.65,          
},
     {
  id: 8,
  nombre: "Contactor",
  tiempo: 18,              
  dependeDe: "Boca",
  factorBoca: 1.5,          
},
    
   {
  id: 9,
  nombre: "Jabalina de proteccion",
  tiempo: 80,              
  dependeDe: "Boca",
  factorBoca: 2,          
},
    
        
    // 💡 Iluminación 
    {
  id: 20,
  nombre: "Aplique simple",
  tiempo: 20,              
  dependeDe: "Boca",
  factorBoca: 0.35,          
},
    {
  id: 21,
  nombre: "Spot LED",
  tiempo: 20,              
  dependeDe: "Boca",
  factorBoca: 0.35,          
},
{
  id: 22,
  nombre: "Tiras LED",
  tiempo: 20,              
  dependeDe: "Boca",
  factorBoca: 0.35,          
},
{
  id: 23,
  nombre: "Reflector",
  tiempo: 35,              
  dependeDe: "Boca",
  factorBoca: 0.65,          
},    
{
  id: 24,
  nombre: "Artefacto colgante liviano",
  tiempo: 35,              
  dependeDe: "Boca",
  factorBoca: 0.75,          
},
{
  id: 25,
  nombre: "Artefacto colgante pesado",
  tiempo: 55,              
  dependeDe: "Boca",
  factorBoca: 1.5,          
},
{
  id: 26,
  nombre: "Equipo tubo led",
  tiempo: 30,              
  dependeDe: "Boca",
  factorBoca: 0.7,          
},
{
  id: 27,
  nombre: "Ventilador techo c/ luminaria",
  tiempo: 55,              
  dependeDe: "Boca",
  factorBoca: 1.5,          
},

{ id: 28, nombre: "Montaje de TV", tiempo: 40, tipo: "calculada", requiereInput: true,
  },
      
    // 🌀 Climatización



    // 📦 Canalización y cableado
{
  id: 30,
  nombre: "Canalizacion",
  tiempo: 5, 
  unidad: "metros",             
  dependeDe: "Boca",
  factorBoca: 0.033,          
},    
{
  id: 31,
  nombre: "Cableado",
  unidad: "Boca",
  dependeDe: "Boca",
  opciones: {
    ObraNueva: { factorBoca: 0.2, tiempo: 7.5 },
    Recableado: { factorBoca: 0.35, tiempo: 15 },
  }, variante: "ObraNueva",
  descripcion: "hasta 5 metros por boca"
},
{
  id: 32,
  nombre: "Cajas",
  tiempo: 5,          
  dependeDe: "Boca",
  factorBoca: 0.045,          
},    
{
  id: 33,
  nombre: "Montaje bandejas portacables",
  tiempo: 15, 
  unidad: "metros",             
  dependeDe: "Boca",
  factorBoca: 0.1,          
},    
{
  id: 34,
  nombre: "Tendido cable por bandeja",
  tiempo: 3.5, 
  unidad: "metros",             
  dependeDe: "Boca",
  factorBoca: 0.13,    
  descripcion: "Tendido, organización y sujeción sobre bandeja."      
},        
/*{
  id: 35,
  nombre: "Tendido cable subterraneo",
  tiempo: 5, 
  unidad: "metros",             
  dependeDe: "Boca",
  factorBoca: 0.3,    
  descripcion: "No contempla tiempos de zanjeo debido a que este es variable segun sea por medio de maquinas o manual."      
},*/        

    // 🧠 Diagnóstico y planificación
  
    // ⚙️ Tableros
{
  id: 40,
  nombre: "Montaje tablero superficie",
  tiempo: 15,          
  dependeDe: "Boca",
  factorBoca: 0.35,          
},    
{
  id: 41,
  nombre: "Montaje tablero embutido",
  tiempo: 45,          
  dependeDe: "Boca",
  factorBoca: 0.75,          
},    
{
  id: 42,
  nombre: "Tablero BEA A/M - 2 bombas",
  tiempo: 300,          
  dependeDe: "Boca",
  factorBoca: 11,          
},    
                    
  

    // 🧠 Automatización y control
{
  id: 50,
  nombre: "Sensor de movimiento",
  tiempo: 20,              
  dependeDe: "Boca",
  factorBoca: 0.35,          
},
{
  id: 51,
  nombre: "Fotocelula",
  tiempo: 20,              
  dependeDe: "Boca",
  factorBoca: 0.35,          
},
{
  id: 52,
  nombre: "Reemplazo de flotante",
  tiempo: 30,              
  dependeDe: "Boca",
  factorBoca: 0.7,          
},
{
  id: 53,
  nombre: "Tareas industriales / automatismos",
  tiempo: 90,              
  dependeDe: "Boca",
  factorBoca: 2.5,          
},
 
    // 🚧 Intervenciones complejas

{
  id: 60,
  nombre: "Reemplazo fusible NH",
  tiempo: 20,          
  dependeDe: "Boca",
  factorBoca: 0.85,          
},   
{
  id: 61,
  nombre: "Reparacion en toma primaria",
  tiempo: 20,          
  dependeDe: "Boca",
  factorBoca: 2.4,          
},   
{
  id: 62,
  nombre: "Pilar monofasico",
  tiempo: 240,          
  dependeDe: "Boca",
  factorBoca: 7.55,          
},   
{
  id: 63,
  nombre: "Pilar trifasico",
  tiempo: 240,          
  dependeDe: "Boca",
  factorBoca: 9.15,          
},   
    
    // 📋 Tareas administrativas - AEA
    { id: 100, nombre: "DCI (Res.Enre 225/11 - 380/15)", tipo: "administrativa", descripcion: "Incluye documentacion y relevamiento. Valores sugeridos COPIME", opciones: {
        "Cat. 1": { valor: 200000 },
        "Cat. 2": { valor: 480000 },
        "Cat. 3": { valor: 1200000 }
      }, variante: "Cat. 1" },

    { id: 102, nombre: "Relevamiento de la instalación eléctrica", tipo: "administrativa", descripcion: "Cat 1: <10KVA- Cat 2: entre 10 y 50KVA - Cat 3: >50KVA (BT). Valores sugeridos COPIME", opciones: {
        "Cat. 1": { valor: 60000 },
        "Cat. 2": { valor: 144000 },
        "Cat. 3": { valor: 360000 }
      }, variante: "Cat. 1" },      

    { id: 106, nombre: "Medicion de Puesta a Tierra (T1-R)", tipo: "administrativa", valor: 160000 },

/*{
  id: 300,
  nombre: "Tablero nuevo",
  tipo: "composicion",
  unidad: "polos",
  cantidad: 96,
  opciones: {
    "Solo armado": { porcentajeDiseno: 0, porcentajeArmado: 0.65 },
    "Solo diseño": { porcentajeDiseno: 0.35, porcentajeArmado: 0 },
    "Diseño + armado": { porcentajeDiseno: 0.35, porcentajeArmado: 0.65 }
  },
  variante: "Solo armado",
  descripcion: "Diseño técnico y/o armado físico del tablero según cantidad de polos.",
}*/

    
  ];