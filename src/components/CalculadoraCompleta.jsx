import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ModalTarifa from "./ModalTarifa";
import ModalSugerencia from "./ModalSugerencia";
import { FaPlus, FaTrash, FaWrench, FaBroom } from "react-icons/fa";
import { useRef } from "react";
import { TooltipInfo } from "./TooltipInfo";
import { tareasPredefinidas } from "../utils/tareas";
// 🚀 importamos Firebase
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";  // 👈 ajustá la ruta si hace falta
import ConfiguracionTarifas from "./calculadora/ConfiguracionTarifas";
import TareasSeleccionadas from "./calculadora/TareasSeleccionadas";
import ResumenPresupuesto from "./calculadora/ResumenPresupuesto";
import BuscadorTareas from "./calculadora/BuscadorTareas";


export default function CalculadoraCompleta() {
  const [busqueda, setBusqueda] = useState("");
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);
  const [tarifaHoraria, setTarifaHoraria] = useState(24300);
  const [costoConsulta, setCostoConsulta] = useState(28000);
  const [ajustePorcentaje, setAjustePorcentaje] = useState(0);
  const [mostrarModalTarifa, setMostrarModalTarifa] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const [mostrarModalSugerencia, setMostrarModalSugerencia] = useState(false);
  const [incluirVisita, setIncluirVisita] = useState(true);

  const sonidoMonedas = useRef(new Audio("/sounds/coin.mp3"));
  const [config, setConfig] = useState(null);

  useEffect(() => {
 const fetchConfig = async () => {
  try {
    const docRef = doc(db, "config", "app");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("CONFIG:", docSnap.data());
      setConfig(docSnap.data());
    } else {
      console.log("❌ No existe el documento config/app");
    }
  } catch (error) {
    console.error("Error cargando config:", error);
  }
};

    fetchConfig();
  }, []);

  // 🔹 Estado para guardar las tareas desde Firestore
  const [tareasDisponibles, setTareasDisponibles] = useState([]);

  useEffect(() => {
    const fetchTareas = async () => {
      const querySnapshot = await getDocs(collection(db, "tareas"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTareasDisponibles(data);
    };
    fetchTareas();
  }, []);

  // 🔹 Solo mostramos las tareas activas en buscador y populares
const tareasFiltradas = tareasDisponibles
  .filter((t) => !t.pausada)
  .filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()));

const tareasPopulares = tareasDisponibles
  .filter((t) => !t.pausada)
  .slice(0, 7);


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
    const varianteConfig =
      tarea.variante && tarea.opciones?.[tarea.variante]
        ? tarea.opciones[tarea.variante]
        : tarea;

    const nuevaTarea = {
      ...tarea,
      id: Date.now() + Math.floor(Math.random() * 1000),
      cantidad: 1,
      tiempo: varianteConfig.tiempo || tarea.tiempo || 0,
      multiplicador: varianteConfig.multiplicador ?? tarea.multiplicador ?? 1,
      valor:
        tarea.tipo === "administrativa"
          ? (varianteConfig.valor ?? tarea.valor ?? 0) // 👈 si hay variante usa su valor
          : (varianteConfig.tiempo / 60) *
            tarifaHoraria *
            (varianteConfig.multiplicador ?? 1),
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
            origen: id,
            cantidad: sub.cantidad || 1,
            tiempo: subConfig.tiempo,
            multiplicador: subConfig.multiplicador ?? 1,
          };
        });

        // reemplazar en lugar de eliminar y pushear
        return tareas.map((t) =>
          t.id === id
            ? {
                ...t,
                variante: valor,
                tiempo: nuevaConfig?.tiempo ?? t.tiempo,
                multiplicador: nuevaConfig?.multiplicador ?? t.multiplicador,
                valor: nuevaConfig?.valor ?? t.valor,
              }
            : t
        ).concat(nuevasInternas);
      }

     if (campo === "cantidad") {
  return tareas.map((t) => {
    if (t.id !== id) return t;

    const nuevaCantidad = parseInt(valor);
    const cantidadFinal = isNaN(nuevaCantidad) || nuevaCantidad < 1 ? 1 : nuevaCantidad;

    const nuevoValor = t.valorUnidad
      ? Math.round((t.valorUnidad * ((t.porcentaje ?? 25) / 100)) * cantidadFinal)
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
                  valor: Math.round(
                    (nuevoValor * ((t.porcentaje ?? 25) / 100)) * (t.cantidad || 1) // 👈 usa el % de Firestore
                  ),
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

        if (tarea.tipo === "calculada" && tarea.valorUnidad !== undefined && tarea.porcentaje !== undefined) {
          const cantidad = tarea.cantidad || 1;
          const valorUnidad = tarea.valorUnidad || 0;
          const porcentaje = tarea.porcentaje || 25;

          // costo dinámico: (valor del TV * % / 100) * cantidad
          return acc + ((valorUnidad * porcentaje) / 100) * cantidad;
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

  if (!config) {
  return <div className="p-4">Cargando configuración...</div>;
}

// 👇 chequeás si está habilitada
if (!config.calculadoraCompletaHabilitada) {
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded">
      🚧 La calculadora está en mantenimiento temporal.
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-bkack-700">💡 Calculadora de Presupuestos</h1>

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

        <ConfiguracionTarifas
          tarifaHoraria={tarifaHoraria}
          setTarifaHoraria={setTarifaHoraria}
          costoConsulta={costoConsulta}
          setCostoConsulta={setCostoConsulta}
          onOpen={() => setMostrarModalTarifa(true)}
        />

        {/* MODAL SUGERENCIA */}
        {mostrarModalSugerencia && (
          <ModalSugerencia onClose={() => setMostrarModalSugerencia(false)} />
        )}
          
        {/* BUSCADOR Y TAREAS POPULARES */}
        <BuscadorTareas
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          indiceSeleccionado={indiceSeleccionado}
          setIndiceSeleccionado={setIndiceSeleccionado}
          tareasFiltradas={tareasFiltradas}
          tareasPopulares={tareasPopulares}
          todasLasTareas={tareasDisponibles.filter((t) => !t.pausada)}  // 👈 aquí
          agregarTarea={agregarTarea}
          setMostrarModalSugerencia={setMostrarModalSugerencia}
        />

        {/* Leyenda informativa sobre tiempos */}
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow text-sm mb-6">
          ℹ️ <strong>Los tiempos sobre las tarea son estimados</strong>.  
          Aquellos con mayor experiencia podrán resolver las tareas más rápido o por el contrario a otros tomar mas tiempo.
        </div>

        {/* TAREAS SELECCIONADAS */}
        <TareasSeleccionadas
          tareasSeleccionadas={tareasSeleccionadas}
          modificarTarea={modificarTarea}
          actualizarCantidad={actualizarCantidad}
          eliminarTarea={eliminarTarea}
          limpiarTareas={limpiarTareas}
          setTareasSeleccionadas={setTareasSeleccionadas}
        />

        {/* Leyenda informativa sobre desarrollo de la app */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow text-sm mb-6">
          ⚠️ <strong>Esta herramienta está en desarrollo y los valores son a modo orientativo.</strong> Si querés sugerir una mejora, podés dejarnos tu mensaje en la <Link to="/comentarios" className="underline text-blue-700 hover:text-blue-900">sección de comentarios</Link>.
        </div>

        {/* RESULTADO FINAL */}
        <ResumenPresupuesto
          tareasSeleccionadas={tareasSeleccionadas}
          tiempoTotal={tiempoTotal}
          horasMargen={horasMargen}
          minutosMargen={minutosMargen}
          ajustePorcentaje={ajustePorcentaje}
          setAjustePorcentaje={setAjustePorcentaje}
          incluirVisita={incluirVisita}
          setIncluirVisita={setIncluirVisita}
          sonidoMonedas={sonidoMonedas}
          costoFinal={costoFinal}
          // 👇 nuevas
          tarifaHoraria={tarifaHoraria}
          visitaSegura={visitaSegura}
          tareasPredefinidas={tareasPredefinidas}
        />

      </div>
    </div>
  );
};
