import { Link } from "react-router-dom";
import { useState } from "react";
import ModalTarifa from "./ModalTarifa";
import ModalSugerencia from "./ModalSugerencia";
import { FaPlus, FaTrash, FaWrench, FaBroom } from "react-icons/fa";
import { ContadorAnimado } from "./ContadorAnimado";
import { useRef } from "react";
import { TooltipInfo } from "./TooltipInfo";
import { tareasPredefinidas } from "../utils/tareas";


export default function CalculadoraCompleta() {
  const [busqueda, setBusqueda] = useState("");
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);
  const [tarifaHoraria, setTarifaHoraria] = useState(16500);
  const [costoConsulta, setCostoConsulta] = useState(25000);
  const [ajustePorcentaje, setAjustePorcentaje] = useState(0);
  const [mostrarModalTarifa, setMostrarModalTarifa] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const [mostrarModalSugerencia, setMostrarModalSugerencia] = useState(false);
  const [incluirVisita, setIncluirVisita] = useState(true);

  const sonidoMonedas = useRef(new Audio("/sounds/coin.mp3"));

  
  const tareasPopulares = tareasPredefinidas.slice(0, 7);

  const tareasFiltradas = tareasPredefinidas.filter((tarea) =>
    tarea.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarTarea = (tarea) => {
    if (tarea.tipo === "paquete") {
  const totalInterno = (tarea.incluye || []).reduce((subAcc, sub) => {
    const base = tareasPredefinidas.find((t) => t.id === sub.id);
    if (!base) return subAcc;

    const baseConfig = sub.variante && base.opciones?.[sub.variante]
      ? base.opciones[sub.variante]
      : base.opciones?.[base.variante] || base;

    const tiempo = baseConfig.tiempo || 0;
    const multiplicador = baseConfig.multiplicador ?? 1;
    const cantidad = sub.cantidad || 1;

    return subAcc + (tiempo / 60) * tarifaHoraria * multiplicador * cantidad;
  }, 0);

  const nuevaTarea = {
    ...tarea,
    id: Date.now() + Math.floor(Math.random() * 1000),
    cantidad: 1,
    tiempo: tarea.incluye
      ? tarea.incluye.reduce((acc, sub) => {
          const base = tareasPredefinidas.find((t) => t.id === sub.id);
          const baseConfig = sub.variante
            ? base?.opciones?.[sub.variante] || base
            : base?.opciones?.[base.variante] || base;

          return acc + (baseConfig?.tiempo || 0) * (sub.cantidad || 1);
        }, 0)
      : 0,
    multiplicador: tarea.resumen?.multiplicador || 1,
    valor: totalInterno,
    incluye: tarea.ocultarSubtareas ? [] : tarea.incluye,
    originalIncluye: tarea.incluye // 👈 clave para que `costoBase` lo pueda leer

  };

  setTareasSeleccionadas((prev) => [...prev, nuevaTarea]);
  return;
}

 else {
      // Tarea normal
      const base = tarea.opciones?.[tarea.variante] || tarea;
  
      const varianteConfig = tarea.variante && tarea.opciones?.[tarea.variante]
    ? tarea.opciones[tarea.variante]
    : tarea;

      const nuevaTarea = {
        ...tarea,
        id: Date.now() + Math.floor(Math.random() * 1000),
        cantidad: 1,
        tiempo: varianteConfig.tiempo || tarea.tiempo,
        multiplicador: varianteConfig.multiplicador ?? tarea.multiplicador ?? 1,
        valor: (varianteConfig.tiempo / 60) * tarifaHoraria * (varianteConfig.multiplicador ?? 1),
        variante: tarea.variante || null,
      };

      setTareasSeleccionadas((prev) => [...prev, nuevaTarea]);
      }
  };
  
  

  const modificarTarea = (id, campo, valor) => {
    setTareasSeleccionadas((tareas) => {
      // Si es cambio de variante, y es "instalacion" o "reemplazo"
      const tareaOriginal = tareas.find((t) => t.id === id);
      if (!tareaOriginal) return tareas;
  
      if (campo === "variante") {
        const base = tareasPredefinidas.find((t) => t.nombre === tareaOriginal.nombre);
        const nuevaConfig = base?.opciones?.[valor];
  
        const nuevasInternas = (nuevaConfig?.incluye || []).map((sub) => {
          const subBase = tareasPredefinidas.find((t) => t.id === sub.id);
          const subConfig = subBase.opciones?.[subBase.variante] || subBase;
  
          return {
            ...subBase,
            id: Date.now() + Math.floor(Math.random() * 1000),
            origen: id, // Identifica a qué tarea principal pertenece
            cantidad: sub.cantidad || 1,
            tiempo: subConfig.tiempo,
            multiplicador: subConfig.multiplicador ?? 1,
          };
        });
  
        return tareas
          .filter((t) => t.id !== id && t.origen !== id) // eliminamos tarea original y sus internas
          .concat([
            {
              ...tareaOriginal,
              variante: valor,
              tiempo: nuevaConfig?.tiempo ?? tareaOriginal.tiempo,
              multiplicador: nuevaConfig?.multiplicador ?? tareaOriginal.multiplicador,
              valor: nuevaConfig?.valor ?? tareaOriginal.valor, // ✅ <- esta línea es la clave
            },
            ...nuevasInternas,
          ]);
      }
     if (campo === "cantidad") {
  return tareas.map((t) => {
    if (t.id !== id) return t;

    const nuevaCantidad = parseInt(valor);
    const cantidadFinal = isNaN(nuevaCantidad) || nuevaCantidad < 1 ? 1 : nuevaCantidad;

    const nuevoValor = t.valorUnidad
      ? Math.round((t.valorUnidad / 4) * cantidadFinal)
      : t.valor;

    return {
      ...t,
      cantidad: cantidadFinal,
      valor: nuevoValor,
    };
  });
}


        if (campo === "valorUnidad") {
      const nuevoValor = parseFloat(valor);
      return tareas.map((t) =>
        t.id === id
          ? {
              ...t,
              valorUnidad: nuevoValor, 
              valor: Math.round((nuevoValor / 4) * (t.cantidad || 1)), // 👈 ahora incluye cantidad
            }
          : t
      );
    }

      // Otros campos como cantidad
      return tareas.map((t) =>
        t.id === id
          ? {
              ...t,
              [campo]: isNaN(parseFloat(valor)) ? 0 : parseFloat(valor),
            }
          : t
      );
    });
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

  const limpiarTareas = () => {
    setTareasSeleccionadas([]);
  };
  
  const tiempoTotal = tareasSeleccionadas.reduce(
    (acc, tarea) => acc + tarea.tiempo * tarea.cantidad,
    0
  );
  const horas = Math.floor(tiempoTotal / 60);
  const minutos = tiempoTotal % 60;
  const tiempoConMargen = tiempoTotal + 30;
  const horasMargen = Math.floor(tiempoConMargen / 60);
  const minutosMargen = tiempoConMargen % 60;


  const tarifaSegura = isNaN(tarifaHoraria) || tarifaHoraria <= 0 ? 0 : tarifaHoraria;
  const visitaSegura = isNaN(costoConsulta) || costoConsulta < 0 ? 0 : costoConsulta;
  
  function calcularTareaConSubtareas(subTarea, tarifaHoraria, tareasPredefinidas) {
  const base = tareasPredefinidas.find((t) => t.id === subTarea.id);
  if (!base) return 0;

  const variante = subTarea.variante || base.variante;
  const baseConfig = variante && base.opciones?.[variante] ? base.opciones[variante] : base;

  const tiempo = baseConfig.tiempo || 0;
  const multiplicador = baseConfig.multiplicador ?? 1;
  const cantidad = subTarea.cantidad || 1;

  const valorPropio = (tiempo / 60) * tarifaHoraria * multiplicador * cantidad;

  const incluye = baseConfig.incluye || [];
  const valorSubtareas = incluye.reduce((acc, sub) => acc + calcularTareaConSubtareas(sub, tarifaHoraria, tareasPredefinidas), 0);

  return valorPropio + valorSubtareas;
}
// Buscar la definición de Boca en tareasPredefinidas
const baseBoca = tareasPredefinidas.find(t => t.nombre === "Boca");
let valorBoca = null;

if (baseBoca) {
  const factor = baseBoca.multiplicador ?? 1;
  valorBoca = (baseBoca.tiempo / 60) * tarifaHoraria * factor;
}


  const costoBase = tareasSeleccionadas.reduce((acc, tarea) => {
    // Si depende de Boca, se calcula a partir de su valor
        if (tarea.dependeDe === "Boca" && valorBoca !== null) {
        let factor = tarea.factorBoca ?? 1;

        if (tarea.variante && tarea.opciones?.[tarea.variante]) {
          factor = tarea.opciones[tarea.variante].factorBoca ?? factor;
        }

        return acc + (valorBoca * factor) * tarea.cantidad;
      }

        if (tarea.tipo === "administrativa") {
          return acc + tarea.valor * tarea.cantidad;
        }
  
       if (tarea.tipo === "paquete") {
          const totalInterno = (tarea.originalIncluye || tarea.incluye || []).reduce((subAcc, subTarea) => {
            return subAcc + calcularTareaConSubtareas(subTarea, tarifaHoraria, tareasPredefinidas);
          }, 0);
          return acc + totalInterno * tarea.cantidad;
        }

        if (tarea.tipo === "composicion") {
          const tiempoPorPolo = 10;
          const multArmado = 2.7;
          const multDiseno = 3.2;
          const horas = (tarea.cantidad * tiempoPorPolo) / 60;

          const costoTotal = horas * tarifaHoraria * (
            tarea.opciones?.["Diseño + armado"]?.porcentajeDiseno * multDiseno +
            tarea.opciones?.["Diseño + armado"]?.porcentajeArmado * multArmado
          );

          const variante = tarea.opciones?.[tarea.variante] || {};
          const pDiseno = variante.porcentajeDiseno ?? 0;
          const pArmado = variante.porcentajeArmado ?? 0;

          const total = costoTotal * (pDiseno + pArmado);

          return acc + total;
        }
        if (tarea.tipo === "calculada" && tarea.valor !== undefined && tarea.valor !== null) {
          return acc + tarea.valor;
        }


    const factor = tarea.multiplicador ?? 1;
    const costoTarea = (tarea.tiempo / 60) * tarifaHoraria * tarea.cantidad * factor;
    return acc + costoTarea;
  }, 0);
  
  

  const costoFinal = isNaN(costoBase)
  ? 0
  : (costoBase + (incluirVisita ? visitaSegura : 0)) + (costoBase * ajustePorcentaje) / 100;

  // Botones + y - adiciona o disminuyen la cantidad de la tarea
  const actualizarCantidad = (id, nuevaCantidad) => {
    setTareasSeleccionadas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, cantidad: Math.max(1, nuevaCantidad) } : t
      )
    );
  };

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
        
        {/* MODAL SUGERENCIA */}
        {mostrarModalSugerencia && (
          <ModalSugerencia onClose={() => setMostrarModalSugerencia(false)} />
        )}
          
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
      className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
        tarea.nombre === "Boca"
          ? "bg-yellow-100 text-yellow-900 border border-yellow-400 italic font-medium hover:bg-yellow-200"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
      onClick={() => agregarTarea(tarea)}
      title={tarea.nombre === "Boca" ? "Esta tarea es útil como unidad de medida para estimaciones rápidas" : ""}
    >
      {tarea.nombre === "Boca" ? "⭐ Boca (unidad)" : tarea.nombre}
    </button>
  ))}
</div>

          
          <div className="text-center">
            <button
              onClick={() => setMostrarModalSugerencia(true)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
            >
              <FaPlus className="inline mr-2" />
              ¿Tenés una tarea que no encontras?
            </button>
          </div>

        </div>

        {/* Leyenda informativa sobre tiempos */}
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow text-sm mb-6">
          ℹ️ <strong>Los tiempos sobre las tarea son estimados</strong>.  
          Aquellos con mayor experiencia podrán resolver las tareas más rápido o por el contrario a otros tomar mas tiempo.
        </div>

        {/* TAREAS SELECCIONADAS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">🛠️ Tareas Seleccionadas</h2>
          {tareasSeleccionadas.length === 0 ? (
            <p className="text-gray-500">No hay tareas agregadas.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 relative">
              {tareasSeleccionadas.map((tarea) => (
                <div
                key={tarea.id}
                className={`flex flex-wrap items-center justify-between border-b pb-2 gap-2 text-sm ${
                  tarea.origen ? "pl-6 text-gray-600 italic" : ""
                }`}
              >
                <span className="flex-1 flex items-center gap-1 relative">
                  {tarea.origen && <span className="text-xs text-blue-400">↳</span>}
                  {tarea.nombre}
                  {tarea.descripcion && (
                  <TooltipInfo texto={tarea.descripcion} />
                  )}

                </span>

                            
                  {/* Selector si la tarea tiene opciones */}
                  {tarea.opciones && (
                    <div className="flex gap-2 flex-wrap">
                    {Object.entries(tarea.opciones).map(([clave, config]) => (
                      <button
                        key={clave}
                        className={`px-2 py-1 text-xs rounded ${
                          tarea.variante === clave
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => {
                          modificarTarea(tarea.id, "variante", clave);
                          modificarTarea(tarea.id, "tiempo", config.tiempo);
                          modificarTarea(tarea.id, "multiplicador", config.multiplicador ?? 1);
                        }}
                      >
                        {clave.replaceAll("-", " ").replace("monofasico", "Monofásico").replace("trifasico", "Trifásico")}
                      </button>
                    ))}
                    </div>
                    )}

                
                  {/* Cantidad */}
                  <div className="flex items-center gap-1">
                    <label className="text-gray-500">
                      {tarea.unidad ? `${tarea.unidad.charAt(0).toUpperCase() + tarea.unidad.slice(1)}:` : "Cant.:"}
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => actualizarCantidad(tarea.id, tarea.cantidad - 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">{tarea.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(tarea.id, tarea.cantidad + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                
                {tarea.requiereInput && (
                  <div className="flex items-center gap-1">
                    <label className="text-gray-500">Valor TV:</label>
                    <input
                      type="number"
                      className="w-24 p-1 border rounded"
                      value={tarea.valorUnidad || ""}
                      onChange={(e) => modificarTarea(tarea.id, "valorUnidad", e.target.value)}
                    />
                  </div>
                )}

                  {/* Tiempo o Valor */}
                  {tarea.tipo === "administrativa" && (
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
                  )}
                
                  {/* Eliminar */}
                  <button
                    className="text-red-600 transition-transform duration-150 hover:scale-150 active:scale-95"
                    onClick={() => eliminarTarea(tarea.id)}
                    title="Eliminar tarea"
                  >
                    <FaTrash />
                  </button>
                </div>            
              ))}
                  {/* Botón en esquina inferior derecha */}
              <div className="sticky bottom-0 flex justify-end p-2 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent">
                <button
                  onClick={limpiarTareas}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-black shadow-md"
                >
                  <FaBroom className="text-white" />
                  Vaciar lista
                </button>
              </div>
            </div>                 
            )}          
        </div>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow text-sm mb-6">
          ⚠️ <strong>Esta herramienta está en desarrollo y los valores son a modo orientativo.</strong> Si querés sugerir una mejora, podés dejarnos tu mensaje en la <Link to="/comentarios" className="underline text-blue-700 hover:text-blue-900">sección de comentarios</Link>.
        </div>

        {/* RESULTADO FINAL */}
        <div className="bg-blue-50 p-6 rounded-xl shadow space-y-4 relative">
          <h2 className="text-xl font-semibold text-blue-800">💰 Resumen del Presupuesto</h2>
          {tareasSeleccionadas.length >= 1 && tiempoTotal > 20 && (
            <p className="text-lg">
              ⏱️ Tiempo Estimado: {/*tiempoConMargen*/}  {horasMargen}h {minutosMargen}min <i className="text-xs text-gray-500">(no incluye tiempo de tareas administrativas.)</i>
            </p>
          )}
 
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="flex-1">
            Ajuste de Precio <i className="text-xs text-gray-500">(% sobre las tareas sin incluir la visita)</i>
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
        {/* Botón fijo dentro del resumen */}
          <div className="absolute top-6 right-6 z-10">
              <button
                onClick={() => {
                  setIncluirVisita((prev) => !prev);
                  sonidoMonedas.current.currentTime = 0; // reinicia el sonido
                  sonidoMonedas.current.play(); // lo reproduce
                }}

                className={`px-4 py-2 rounded-full text-sm sm:text-base sm:px-5 sm:py-2 font-semibold shadow-md transition-all duration-300 ease-in-out hover:scale-105 ${
                  incluirVisita ? "bg-red-600 text-white" : "bg-green-600 text-white"
                }`}
              >
                {incluirVisita ? "Cobrando visita" : "Visita bonificada"}
              </button>
          </div>
            <ContadorAnimado valor={costoFinal} />
          </div>
        </div>
      </div>
    </div>
  );
}
