    import { Link } from "react-router-dom";
    import { useState } from "react";
    import ModalTarifa from "./ModalTarifa";
    import { FaPlus, FaTrash, FaWrench } from "react-icons/fa";
    import { ContadorAnimado } from "./ContadorAnimado";

    export default function CalculadoraCompleta() {
      const [busqueda, setBusqueda] = useState("");
      const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);
      const [tarifaHoraria, setTarifaHoraria] = useState(16500);
      const [costoConsulta, setCostoConsulta] = useState(25000);
      const [ajustePorcentaje, setAjustePorcentaje] = useState(0);
      const [mostrarModalTarifa, setMostrarModalTarifa] = useState(false);
      const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);

    
      const tareasPredefinidas = [
        /* Tareas sencillas */
        { id: 1, nombre: "Reemplazo de toma corriente", tiempo: 15, multiplicador: 2 },
        { id: 2, nombre: "Instalar interruptor diferencial", tiempo: 15 },
        { id: 3, nombre: "Instalacion de artefacto LED", tiempo: 15, multiplicador: 2.3 },
        { id: 4, nombre: "Reparación de cortocircuito", tiempo: 90, multiplicador: 1.85 },
        { id: 5, nombre: "Reemplazo de termomagnetica", tiempo: 15, multiplicador: 2.5  },
        { id: 6, nombre: "Instalacion de ventilador de techo", tiempo: 80, multiplicador: 2.6  },
        { id: 7, nombre: "Instalacion de punto de luz", tiempo: 45 },
        { id: 8, nombre: "Reemplazo de interruptor simples", tiempo: 15 },
        { id: 9, nombre: "Cableado de circuito adicional", tiempo: 120 },
        { id: 10, nombre: "Reemplazo de flotante", tiempo: 80, multiplicador: 1.2 },
        { id: 11, nombre: "Reemplazo de interruptor doble", tiempo: 18 },
        { id: 12, nombre: "Instalacion de portero eléctrico", tiempo: 120 },
        { id: 13, nombre: "Instalacion de toma corriente adicional", tiempo: 40 },
        { id: 14, nombre: "Reemplazo de luminarias defectuosa", tiempo: 10, multiplicador: 1.5 },
        { id: 15, nombre: "Montaje de TV", tiempo: 40, multiplicador: 5 },
        { id: 16, nombre: "Instalacion de protector de tensión", tiempo: 15 },
        { id: 17, nombre: "Montaje de luminarias comerciales", tiempo: 20, multiplicador: 3.5 },
        { id: 18, nombre: "Logistica compra de materiales", tiempo: 30, multiplicador: 1.5 },
        { id: 19, nombre: "", tiempo: 60 },
        { id: 20, nombre: "", tiempo: 15 },

        /* Tareas avanzadas */
        { id: 32, nombre: "Instalación de reflectores", tiempo: 30, multiplicador: 1.85 },
        { id: 33, nombre: "Instalacion de sensores de movimiento", tiempo: 30, multiplicador: 1.85 },
        { id: 34, nombre: "Cambio de fusibles", tiempo: 15, multiplicador: 3.5 },
        { id: 35, nombre: "Instalacion de tablero en superficie", tiempo: 45, multiplicador: 1.5 },
        { id: 36, nombre: "", tiempo: 18 },
        { id: 37, nombre: "", tiempo: 20, multiplicador: 5 },
        { id: 38, nombre: "Instalación de sistema de alarma", tiempo: 60 },
        { id: 39, nombre: "Instalacion de fotocélulas", tiempo: 30, multiplicador: 1.85 },
        { id: 40, nombre: "", tiempo: 45 },
        { id: 41, nombre: "Reparación en toma primaria", tiempo: 120, multiplicador: 3 },
        { id: 42, nombre: "", tiempo: 45 },
        { id: 43, nombre: "Generar automatizacion", tiempo: 120, multiplicador: 2 },
        { id: 44, nombre: "Tareas industriales", tiempo: 90, multiplicador: 3 },
        { id: 45, nombre: "Instalacion de tablero embutido", tiempo: 45, multiplicador: 2},
        { id: 46, nombre: "Cambio de contactores", tiempo: 15, multiplicador: 3.5 },
        { id: 47, nombre: "Instalacion de Jabalina", tiempo: 80, multiplicador: 3.2 },
        { id: 48, nombre: "", tiempo: 45 },
        { id: 49, nombre: "", tiempo: 30 },
        { id: 50, nombre: "Instalación de aire acondicionado split", tiempo: 200, multiplicador: 2.35 },
        { id: 51, nombre: "", tiempo: 80 },
        { id: 52, nombre: "Mecanizado de tablero", tiempo: 120, multiplicador: 4  },
        { id: 53, nombre: "", tiempo: 80 },
        { id: 54, nombre: "", tiempo: 80 },
        
       
        /* Tareas administrativas */
        { id: 73, nombre: "Esquema unifilar del tablero", tipo: "administrativa", valor: 140000 },
        { id: 74, nombre: "DCI - Cat.1 (incluye Doc.+Relev.)", tipo: "administrativa", valor: 200000 },
        { id: 75, nombre: "DCI - Cat.2 (incluye Doc.+Relev.)", tipo: "administrativa", valor: 480000 },
        { id: 76, nombre: "DCI - Cat.3 (incluye Doc.+Relev.)", tipo: "administrativa", valor: 1200000 },
        { id: 77, nombre: "Elaborar documentacion - Cat. 1", tipo: "administrativa", valor: 140000 },
        { id: 78, nombre: "Elaborar documentacion - Cat. 2", tipo: "administrativa", valor: 336000 },
        { id: 79, nombre: "Elaborar documentacion - Cat. 3", tipo: "administrativa", valor: 840000 },
        { id: 80, nombre: "Medicion de Puesta a Tierra (Jabalina)", tipo: "administrativa", valor: 160000 },
        { id: 81, nombre: "Plano o Croquis esquematico", tipo: "administrativa", valor: 160000 },
        { id: 82, nombre: "Relevamiento de la instalacion - Cat. 1 (residencia pequeña)", tipo: "administrativa", valor: 60000 },
        { id: 83, nombre: "Relevamiento de la instalacion - Cat. 2 (comercio pequeño)", tipo: "administrativa", valor: 144000 },
        { id: 84, nombre: "Relevamiento de la instalacion - Cat. 3 (shoppings, etc.)", tipo: "administrativa", valor: 360000 },

      ];
    
      const tareasPopulares = tareasPredefinidas.slice(0, 6);
    
      const tareasFiltradas = tareasPredefinidas.filter((tarea) =>
        tarea.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    
      const agregarTarea = (tarea) => {
        if (!tareasSeleccionadas.some((t) => t.id === tarea.id)) {
          setTareasSeleccionadas([
            ...tareasSeleccionadas,
            {
              ...tarea,
              cantidad: 1,
              tiempo: tarea.tiempo || 0,
              valor: tarea.valor || 0,
            },
          ]);
        }
      };
      
    
      const modificarTarea = (id, campo, valor) => {
        setTareasSeleccionadas(
          tareasSeleccionadas.map((tarea) =>
            tarea.id === id ? { ...tarea, [campo]: parseInt(valor) || 0 } : tarea
          )
        );
      };
    
      const eliminarTarea = (id) => {
        setTareasSeleccionadas(tareasSeleccionadas.filter((t) => t.id !== id));
      };
    
      const agregarTareaPersonalizada = () => {
        const nombre = prompt("Ingrese el nombre de la tarea:");
        const tiempo = parseInt(prompt("Ingrese el tiempo estimado en minutos:"), 10);
        if (nombre && tiempo) {
          setTareasSeleccionadas([
            ...tareasSeleccionadas,
            { id: Date.now(), nombre, tiempo, cantidad: 1 },
          ]);
        }
      };
    
      const tiempoTotal = tareasSeleccionadas.reduce(
        (acc, tarea) => acc + tarea.tiempo * tarea.cantidad,
        0
      );
      const horas = Math.floor(tiempoTotal / 60);
      const minutos = tiempoTotal % 60;
    
      const tarifaSegura = isNaN(tarifaHoraria) || tarifaHoraria <= 0 ? 0 : tarifaHoraria;
      const visitaSegura = isNaN(costoConsulta) || costoConsulta < 0 ? 0 : costoConsulta;
      const costoBase = tareasSeleccionadas.reduce((acc, tarea) => {
        if (tarea.tipo === "administrativa") {
          return acc + tarea.valor * tarea.cantidad;
        }
        const factor = tarea.multiplicador ?? 1;
        const costoTarea = (tarea.tiempo / 60) * tarifaHoraria * tarea.cantidad * factor;
        return acc + costoTarea;
      }, 0);
      

      const costoFinal = isNaN(costoBase)
        ? 0
        : costoBase + visitaSegura + (costoBase * ajustePorcentaje) / 100;

      return (
        <div className="min-h-screen bg-gray-100 py-5 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-center text-blue-700">💡 Calculadora de Presupuestos</h1>
    
            {/* MODAL TARIFA */}
            {mostrarModalTarifa && (
              <ModalTarifa
                tarifaHoraria={tarifaHoraria}
                setTarifaHoraria={setTarifaHoraria}
                costoConsulta={costoConsulta}
                setCostoConsulta={setCostoConsulta}
                onClose={() => setMostrarModalTarifa(false)}
              />
            )}
    
            {/* CONFIGURACIÓN DE TARIFAS */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">⚙️ Configuración de Tarifas</h2>
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                  onClick={() => setMostrarModalTarifa(true)}
                >
                  Calcular Tarifa
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  Tarifa Horaria ($/h):
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={tarifaHoraria}
                    onChange={(e) => setTarifaHoraria(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Valor de la visita ($):
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={costoConsulta}
                    onChange={(e) => setCostoConsulta(parseFloat(e.target.value))}
                  />
                </label>
              </div>
            </div>
              
            {/* BUSCADOR Y TAREAS POPULARES */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              <h2 className="text-xl font-semibold">📋 Buscar y Agregar Tarea</h2>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Buscar tarea..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    setIndiceSeleccionado((prev) =>
                      Math.min(prev + 1, tareasFiltradas.length - 1)
                    );
                  } else if (e.key === "ArrowUp") {
                    setIndiceSeleccionado((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === "Enter" && tareasFiltradas[indiceSeleccionado]) {
                    agregarTarea(tareasFiltradas[indiceSeleccionado]);
                    setBusqueda("");
                    setIndiceSeleccionado(-1);
                  }
                }}
/>

              {busqueda && (
                <div className="border rounded bg-white max-h-40 overflow-auto">
                  {tareasFiltradas.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm text-center">
                      Si la tarea es de tipo administrativa envianos un mensaje para poder añadirla a la lista.
                    </div>
                  ) : (
                    tareasFiltradas.map((tarea, i) => (
                      <div
                        key={tarea.id}
                        className={`p-2 cursor-pointer hover:bg-gray-100 ${
                          i === indiceSeleccionado ? "bg-blue-100 font-semibold" : ""
                        }`}
                        onClick={() => {
                          agregarTarea(tarea);
                          setBusqueda("");
                          setIndiceSeleccionado(-1);
                        }}
                      >
                        {tarea.nombre}
                      </div>
                    ))
                  )}
                </div>
              )}

    
              <div className="flex flex-wrap gap-2">
                {tareasPopulares.map((tarea) => (
                  <button
                    key={tarea.id}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
                    onClick={() => agregarTarea(tarea)}
                  >
                    {tarea.nombre}
                  </button>
                ))}
              </div>
    
              <div className="text-center">
                <button
                  onClick={agregarTareaPersonalizada}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FaPlus className="inline mr-2" />
                  Agregar Tarea Personalizada
                </button>
              </div>
            </div>
    
            {/* Leyenda informativa sobre tiempos */}
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow text-sm mb-6">
              ℹ️ <strong>Los tiempos las tarea son estimados</strong>.  
              Aquellos con mayor experiencia podrán resolver las tareas más rápido o por el contrario a otros tomar mas tiempo. Es por ello, que pueden editarlo según su criterio.
            </div>

            {/* TAREAS SELECCIONADAS */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">🛠️ Tareas Seleccionadas</h2>
              {tareasSeleccionadas.length === 0 ? (
                <p className="text-gray-500">No hay tareas agregadas.</p>
              ) : (
                <div className="space-y-2">
                  {tareasSeleccionadas.map((tarea) => (
                    <div
                      key={tarea.id}
                      className="flex flex-wrap items-center justify-between border-b pb-2 gap-2 text-sm"
                    >
                      <span className="flex-1">{tarea.nombre}</span>

                      <div className="flex items-center gap-1">
                        <label className="text-gray-500">Cant.:</label>
                        <input
                          type="number"
                          min="1"
                          className="w-16 p-1 border rounded"
                          value={tarea.cantidad}
                          onChange={(e) =>
                            modificarTarea(tarea.id, "cantidad", e.target.value)
                          }
                        />
                      </div>

                      {tarea.tipo === "administrativa" ? (
                      <div className="flex items-center gap-1">
                        <label className="text-gray-500">Valor:</label>
                        <input
                          type="number"
                          className="w-24 p-1 border rounded"
                          value={tarea.valor}
                          onChange={(e) =>
                            modificarTarea(tarea.id, "valor", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <label className="text-gray-500">Min.:</label>
                        <input
                          type="number"
                          min="1"
                          className="w-16 p-1 border rounded"
                          value={tarea.tiempo}
                          onChange={(e) =>
                            modificarTarea(tarea.id, "tiempo", e.target.value)
                          }
                        />
                      </div>
                    )}

                      <button
                        className="text-red-600"
                        onClick={() => eliminarTarea(tarea.id)}
                        title="Eliminar tarea"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow text-sm mb-6">
              ⚠️ <strong>Esta herramienta está en desarrollo y los valores son a modo orientativo.</strong> Si querés sugerir una mejora, podés dejarnos tu mensaje en la <Link to="/comentarios" className="underline text-blue-700 hover:text-blue-900">sección de comentarios</Link>.
            </div>

            {/* RESULTADO FINAL */}
            <div className="bg-blue-50 p-6 rounded-xl shadow space-y-4">
              <h2 className="text-xl font-semibold text-blue-800">💰 Resumen del Presupuesto</h2>
              <p className="text-lg">⏱️ Tiempo Total: {tiempoTotal} min ({horas}h {minutos}min) <u><i>no cuenta el tiempo de las tareas admin.</i></u></p>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="flex-1">
                  Ajuste de Precio <br />(<i>% sobre el valor de las tareas s/visita</i>):
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={ajustePorcentaje}
                    onChange={(e) => setAjustePorcentaje(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="block text-center mt-1">{ajustePorcentaje}%</span>
                </label>
                <ContadorAnimado valor={costoFinal} />

              </div>
            </div>
          </div>
        </div>
      );
    }
