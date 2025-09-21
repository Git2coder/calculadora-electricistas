// CalculadoraCompleta.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ModalTarifa from "./ModalTarifa";
import ModalSugerencia from "./ModalSugerencia";
import { ImUsers } from "react-icons/im";
import { FaPlus, FaTrash, FaWrench, FaBroom, FaHardHat, FaBolt, FaClock } from "react-icons/fa";
import { RiExpandHeightFill } from "react-icons/ri";
import { useRef } from "react";
import { TooltipInfo } from "./TooltipInfo";
import { tareasPredefinidas } from "../utils/tareas";
// 🚀 importamos Firebase
import { collection, getDocs, doc, getDoc, query, orderBy, limit, updateDoc, increment, where } from "firebase/firestore";
import { db } from "../firebaseConfig";  // 👈 ajustá la ruta si hace falta
import ConfiguracionTarifas from "./calculadora/ConfiguracionTarifas";
import TareasSeleccionadas from "./calculadora/TareasSeleccionadas";
import ResumenPresupuesto from "./calculadora/ResumenPresupuesto";
import BuscadorTareas from "./calculadora/BuscadorTareas";
import { getAuth } from "firebase/auth";

// 🔹 Extras elegantes que multiplican el costo/tiempo

{/*En altura → +50% tiempo (más de 3 m, escaleras, techos, fachadas).
- Doble operario requerido → +30% (peso, seguridad, sostener piezas grandes).
- Acceso restringido → +25% (ej: espacios muy reducidos, debajo de mesadas, entre cielorrasos).
- Zona exterior / intemperie → +20% (tiempo extra por fijaciones, sellado, seguridad).
- Trabajo nocturno / fuera de horario → +50% (disponibilidad y seguridad).
- Instalación en servicio (sin corte) → +40% (maniobra con tensión, riesgo eléctrico).*/}

// CalculadoraCompleta.jsx
export const extrasDisponibles = [
  { id: "altura", nombre: "Trabajo en altura", multiplicador: 1.25 },
  { id: "doble", nombre: "Refuerzo de personal", multiplicador: 1.15 },
  { id: "riesgo", nombre: "Instalación en servicio", multiplicador: 1.3 },
  { id: "urgencia", nombre: "Trabajo urgente / fuera de horario", multiplicador: 1.5 },
];

const extrasGlobales = [
  { id: "altura", label: "Trabajo en altura", multiplicador: 1.25, icon: <RiExpandHeightFill /> },
  { id: "dosOperarios", label: "Refuerzo de personal", multiplicador: 1.15, icon: <ImUsers /> },
  { id: "riesgo", label: "Instalación en servicio", multiplicador: 1.3, icon: <FaBolt /> },
  { id: "urgencia", label: "Urgente / fuera de horario", multiplicador: 1.5, icon: <FaClock /> },
];

export default function CalculadoraCompleta({ modoPreview = false }) {
  const [busqueda, setBusqueda] = useState("");
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);
  const [tarifaHoraria, setTarifaHoraria] = useState(null);
  const [costoConsulta, setCostoConsulta] = useState(null);
  const [ajustePorcentaje, setAjustePorcentaje] = useState(0);
  const [mostrarModalTarifa, setMostrarModalTarifa] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const [mostrarModalSugerencia, setMostrarModalSugerencia] = useState(false);
  const [incluirVisita, setIncluirVisita] = useState(true);
  const [config, setConfig] = useState(null);
  const sonidoMonedas = useRef(new Audio("/sounds/coin.mp3"));
  const [extrasSeleccionadosGlobal, setExtrasSeleccionadosGlobal] = useState([]);

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
  
  // 👇 nuevo: cargar tarifas personalizadas del usuario
  useEffect(() => {
    const fetchUserTarifas = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return; // nadie logueado

        const userRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.tarifaHoraria === "number") {
            setTarifaHoraria(data.tarifaHoraria);
          }
          if (typeof data.costoConsulta === "number") {
            setCostoConsulta(data.costoConsulta);
          }
        }
      } catch (error) {
        console.error("Error cargando tarifas del usuario:", error);
      }
    };

    fetchUserTarifas();
  }, []);

  // 🔹 Estado para guardar las tareas desde Firestore
  const [tareasDisponibles, setTareasDisponibles] = useState([]);
  const [tareasPopulares, setTareasPopulares] = useState([]);

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tareas"));
        const data = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const tareaData = docSnap.data();
            if (tareaData.usos === undefined) {
              try {
                await updateDoc(doc(db, "tareas", docSnap.id), { usos: 0 });
                tareaData.usos = 0;
              } catch (e) {
                console.error("No se pudo inicializar usos:", e);
              }
            }

            return {
              idFirestore: docSnap.id, // 👈 guardamos id real de Firestore
              ...tareaData,
            };
          })
        );

        setTareasDisponibles(data);
      } catch (error) {
        console.error("Error cargando tareas:", error);
      }
    };

    fetchTareas();
  }, []);

  // 🔹 Populars: Boca fija + Top por usos
  useEffect(() => {
    const fetchTareasPopulares = async () => {
      try {
        // 1) Traer BOCA por nombre (case-insensitive en client)
        const qBoca = query(
          collection(db, "tareas"),
          where("nombre", "==", "Boca"),
          limit(1)
        );

        // 2) Traer top por usos (más de 7 para luego filtrar pausadas/duplicados)
        const qTop = query(
          collection(db, "tareas"),
          orderBy("usos", "desc"),
          limit(20)
        );

        const [bocaSnap, topSnap] = await Promise.all([getDocs(qBoca), getDocs(qTop)]);

        const bocaDoc = bocaSnap.docs[0];
        const boca = bocaDoc
          ? { idFirestore: bocaDoc.id, ...bocaDoc.data() }
          : null;

        const top = topSnap.docs.map((d) => ({ idFirestore: d.id, ...d.data() }));

        // 3) Armado final: Boca primero (si existe) + top activos (no pausadas), sin duplicar Boca
        const final = [];

        // Si querés mostrar Boca aunque esté pausada, usá: if (boca) final.push(boca);
        if (boca && !boca.pausada) final.push(boca);

        const faltan = 7 - final.length;

        const resto = top
          .filter((t) => !t.pausada)
          .filter(
            (t) =>
              !boca ||
              (t.idFirestore !== boca.idFirestore &&
                (t.nombre || "").toLowerCase() !== "boca")
          );

        // 🔹 Mezclar aleatoriamente con sort + Math.random
        const mezclados = resto.sort(() => Math.random() - 0.5);

        // 🔹 Tomar solo los que faltan para completar 7
        const lista = [...final, ...mezclados.slice(0, Math.max(faltan, 0))];


        // 4) (Opcional) Sellar orden por si el render vuelve a ordenar
        const conRank = lista.map((t, i) => ({ ...t, __rank_popular: i }));

        setTareasPopulares(conRank);
      } catch (error) {
        console.error("Error cargando tareas populares:", error);
      }
    };

    fetchTareasPopulares();
  }, []);

  // 🔹 Solo mostramos las tareas activas en buscador y populares
  const tareasFiltradas = tareasDisponibles
    .filter((t) => !t.pausada)
    .filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  
  const agregarTarea = async (tarea) => {
    if (tarea.tipo === "paquete") {
      const totalInterno = (tarea.incluye || []).reduce((subAcc, sub) => {
        const base = tareasPredefinidas.find((t) => t.uid === sub.id);
        if (!base) return subAcc;

        const baseConfig =
          sub.variante && base.opciones?.[sub.variante]
            ? base.opciones[sub.variante]
            : base.opciones?.[base.variante] || base;

        const tiempo = baseConfig.tiempo || 0;
        const multiplicador = baseConfig.multiplicador ?? 1;
        const cantidad = sub.cantidad || 1;

        return subAcc + (tiempo / 60) * tarifaHoraria * multiplicador * cantidad;
      }, 0);

      const nuevaTarea = {
        ...tarea,
        uid: Date.now() + Math.floor(Math.random() * 1000),
        cantidad: 1,
        tiempo: tarea.incluye
          ? tarea.incluye.reduce((acc, sub) => {
              const base = tareasPredefinidas.find((t) => t.uid === sub.id);
              const baseConfig = sub.variante
                ? base?.opciones?.[sub.variante] || base
                : base?.opciones?.[base.variante] || base;

              return acc + (baseConfig?.tiempo || 0) * (sub.cantidad || 1);
            }, 0)
          : 0,
        multiplicador: tarea.resumen?.multiplicador || 1,
        valor: totalInterno,
        incluye: tarea.ocultarSubtareas ? [] : tarea.incluye,
        originalIncluye: tarea.incluye,
        extras: [] // 👈 inicializo extras también en paquetes
      };

      setTareasSeleccionadas((prev) => [...prev, nuevaTarea]);

      // 🔹 registrar uso
      try {
        if (tarea.idFirestore) {
          const tareaRef = doc(db, "tareas", tarea.idFirestore);
          await updateDoc(tareaRef, { usos: increment(1) });
        }
      } catch (error) {
        console.error("Error incrementando contador de tarea:", error);
      }

      return;
    }

    // 🔹 OTRAS TAREAS
    // Usa las opciones de ESTA tarea
    const varianteConfig =
      (tarea.variante && tarea.opciones?.[tarea.variante])
        ? tarea.opciones[tarea.variante]
        : undefined;

    const nuevaTarea = {
      ...tarea,
      uid: Date.now() + Math.floor(Math.random() * 1000),
      cantidad: 1,
      // si hay variante elegida, tomar sus campos; si no, caer al de la tarea
      tiempo: (varianteConfig?.tiempo ?? tarea.tiempo ?? 0),
      multiplicador: (varianteConfig?.multiplicador ?? tarea.multiplicador ?? 1),
      // valor queda en 0 al inicio para "calculada" hasta que el usuario ingrese valorUnidad
      valor:
        tarea.tipo === "administrativa"
          ? (varianteConfig?.valor ?? tarea.valor ?? 0)
          : tarea.tipo === "calculada"
            ? 0
            : ((varianteConfig?.tiempo ?? tarea.tiempo ?? 0) / 60) *
              tarifaHoraria *
              (varianteConfig?.multiplicador ?? tarea.multiplicador ?? 1),
      valorUnidad: tarea.valorUnidad ?? 0,
      porcentaje: (varianteConfig?.porcentaje ?? tarea.porcentaje ?? 0),
      variante: tarea.variante ?? null,
      extras: [] // 👈 nuevo: siempre inicializo extras como array de ids
    };

    setTareasSeleccionadas((prev) => [...prev, nuevaTarea]);

    // 🔹 registrar uso
    try {
      if (tarea.idFirestore) {
        const tareaRef = doc(db, "tareas", tarea.idFirestore);
        await updateDoc(tareaRef, { usos: increment(1) });
      }
    } catch (error) {
      console.error("Error incrementando contador de tarea:", error);
    }
  };
  
  const modificarTarea = (id, campo, valor) => {
    setTareasSeleccionadas((tareas) => {
      // Si es cambio de variante, y es "instalacion" o "reemplazo"
      const tareaOriginal = tareas.find((t) => t.uid === id);
      if (!tareaOriginal) return tareas;
  
      if (campo === "variante") {
        // Usamos las opciones de la MISMA tarea que viene de Firestore
        const nuevaConfig = tareaOriginal?.opciones?.[valor];

        return tareas.map((t) =>
          t.uid === id
            ? {
                ...t,
                variante: valor,
                // Traemos todo de la variante elegida si existe
                tiempo: nuevaConfig?.tiempo ?? t.tiempo,
                multiplicador: nuevaConfig?.multiplicador ?? t.multiplicador,
                porcentaje: nuevaConfig?.porcentaje ?? t.porcentaje,
                // Recalcular el valor si ya hay valorUnidad cargado
                valor: t.valorUnidad
        ? Math.round(
            ((t.valorUnidad || 0) *
              ((nuevaConfig?.porcentaje ?? (t.porcentaje || 0))) / 100) *
            (t.cantidad || 1)
          )
        : t.valor,

              }
            : t
        );
      }

      if (campo === "cantidad") {
        return tareas.map((t) => {
          if (t.uid !== id) return t;

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
          t.uid === id
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
        t.uid === id
          ? {
              ...t,
              [campo]: isNaN(parseFloat(valor)) ? 0 : parseFloat(valor),
            }
          : t
      );
    });
  };

  const eliminarTarea = (id) => {
    setTareasSeleccionadas(tareasSeleccionadas.filter((t) => t.uid !== id));
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
  
  // Buscar la definición de Boca en tareasPredefinidas
  const baseBoca = tareasPredefinidas.find(t => t.nombre === "Boca");
  let valorBoca = null;

  if (baseBoca) {
    const factor = baseBoca.multiplicador ?? 1;
    valorBoca = (baseBoca.tiempo / 60) * tarifaHoraria * factor;
  }

  // 🔹 Toggle de extra en una tarea
  // ahora recibe (uid, extraId) y almacena solo el id en el array extras
  const toggleExtra = (uid, extraId) => {
    setTareasSeleccionadas((prev) =>
      prev.map((t) =>
        t.uid === uid
          ? {
              ...t,
              extras: t.extras?.includes(extraId)
                ? t.extras.filter((e) => e !== extraId) // quitar
                : [...(t.extras || []), extraId] // agregar
            }
          : t
      )
    );
  };

  // --- Calcular subtotal de cada tarea seleccionada ---
  const subtotalDeTarea = (tarea) => {
    let base = 0;

    if (tarea.nombre === "Boca" && valorBoca !== null) {
      base = valorBoca * (tarea.cantidad || 1);
    } else if (tarea.tipo === "base") {
      base = (tarea.tiempo / 60) * tarifaHoraria * (tarea.multiplicador ?? 1) * (tarea.cantidad || 1);
    } else if (tarea.dependeDe === "Boca" && valorBoca !== null) {
      let factor = tarea.factorBoca ?? 1;
      if (tarea.variante && tarea.opciones?.[tarea.variante]) {
        factor = tarea.opciones[tarea.variante].factorBoca ?? factor;
      }
      base = valorBoca * factor * (tarea.cantidad || 1);
    } else if (tarea.tipo === "administrativa") {
      base = (tarea.valor || 0) * (tarea.cantidad || 1);
    } else if (tarea.tipo === "calculada") {
      const cantidad = tarea.cantidad || 1;
      const valorUnidad = tarea.valorUnidad || 0;
      const porcentaje = tarea.porcentaje || 0;
      base = ((valorUnidad * porcentaje) / 100) * cantidad;
    } else {
      const factor = tarea.multiplicador ?? 1;
      base = (tarea.tiempo / 60) * tarifaHoraria * (tarea.cantidad || 1) * factor;
    }

    // 👇 aplicar extras (solo si no es administrativa)
    if (tarea.tipo !== "administrativa") {
      const extraFactor = (tarea.extras || []).reduce((acc, eId) => {
        const ed = extrasDisponibles.find((x) => x.id === eId);
        return acc * (ed?.multiplicador ?? 1);
      }, 1);
      return base * extraFactor;
    }

    return base;
  };


  // --- Calcular costo base total ---
  const costoBase = tareasSeleccionadas.reduce(
    (acc, tarea) => acc + subtotalDeTarea(tarea),
    0
  );

  let total = costoBase;  // 👈 corregido

  // Aplicar multiplicadores globales
  extrasSeleccionadosGlobal.forEach((id) => {
    const extra = extrasGlobales.find((e) => e.id === id);
    if (extra) {
      total *= extra.multiplicador;
    }
  });

  // Sumar visita + ajustes
  const costoFinal = isNaN(total)
    ? 0
    : (total + (incluirVisita ? visitaSegura : 0)) + (total * ajustePorcentaje) / 100;


  // Botones + y - adiciona o disminuyen la cantidad de la tarea
  const actualizarCantidad = (id, nuevaCantidad) => {
    setTareasSeleccionadas((prev) =>
      prev.map((t) =>
        t.uid === id ? { ...t, cantidad: Math.max(1, nuevaCantidad) } : t
      )
    );
  };

  // Tarifa y visita: usan config si existe, si no, valores de preview
  const tarifa = tarifaHoraria ?? (modoPreview ? 5000 : null);
  const visita = costoConsulta ?? (modoPreview ? 0 : null);

  // 👇 Condición para mostrar "cargando"
  if (!modoPreview && (tarifa === null || visita === null)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">⏳ Cargando configuración...</p>
      </div>
    );
  }

  // 👇 chequeás si está habilitada
  if (!modoPreview && config && !config.calculadoraCompletaHabilitada) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded">
        🚧 La calculadora está en mantenimiento temporal.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 👇 chequeo si los datos de Firestore ya cargaron */}
        {(!modoPreview && (tarifaHoraria === null || costoConsulta === null)) ? (
          <p className="text-center text-gray-500">Cargando configuración...</p>
        ) : (
          <>
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
              extrasDisponibles={extrasDisponibles}   // 👈 pasamos esto
              toggleExtra={toggleExtra}               // 👈 y esto también
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
              extrasGlobales={extrasGlobales}
              extrasSeleccionadosGlobal={extrasSeleccionadosGlobal}  
              setExtrasSeleccionadosGlobal={setExtrasSeleccionadosGlobal}
            />
          </>
        )}
      </div>
    </div>
  );
};
