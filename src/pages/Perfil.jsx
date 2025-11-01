import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCircle,
  FaClock,
  FaEdit,
  FaSave,
  FaCrown,
} from "react-icons/fa";

export default function Perfil() {
  const { usuario } = useAuth();
  const [etapa, setEtapa] = useState(null);
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({});

  useEffect(() => {
    if (usuario) {
      setDatos({
        ciudad: usuario.ciudad || "",
        provincia: usuario.provincia || "",
        grado: usuario.grado || "",
        experiencia: usuario.experiencia || "",
        modalidadTrabajo: usuario.modalidadTrabajo || "",
        especialidad: usuario.especialidad || "",
      });
    }
  }, [usuario]);

  useEffect(() => {
    const cargarEtapa = async () => {
      const snap = await getDoc(doc(db, "config", "app"));
      if (snap.exists()) setEtapa(snap.data().etapa);
    };
    cargarEtapa();
  }, []);

  if (!usuario) {
    return (
      <div className="text-center py-20 text-gray-600">
        Cargando tus datos...
      </div>
    );
  }

  const formatearFecha = (f) => {
    if (!f) return "-";
    if (f.toDate) return f.toDate().toLocaleDateString();
    if (typeof f === "string") return new Date(f).toLocaleDateString();
    if (f.seconds) return new Date(f.seconds * 1000).toLocaleDateString();
    return "-";
  };

  const ahora = new Date();
  const expira = usuario.fechaExpiracion
    ? new Date(
        usuario.fechaExpiracion.toDate
          ? usuario.fechaExpiracion.toDate()
          : usuario.fechaExpiracion
      )
    : null;

  let estadoCuenta = {
    texto: "Activo",
    color: "text-green-600",
    icono: <FaCheckCircle className="text-green-500 text-lg" />,
    descripcion: "Tu cuenta está habilitada para acceder a la calculadora.",
  };

  if (usuario.estado === "suspendido") {
    estadoCuenta = {
      texto: "Suspendido",
      color: "text-red-600",
      icono: <FaExclamationTriangle className="text-red-500 text-lg" />,
      descripcion:
        "Tu cuenta fue suspendida temporalmente. Comunicate con soporte si creés que es un error.",
    };
  } else if (etapa === "lanzamiento") {
    if (!usuario.suscripcionActiva && (!expira || expira < ahora)) {
      estadoCuenta = {
        texto: "Expirado",
        color: "text-orange-600",
        icono: <FaClock className="text-orange-500 text-lg" />,
        descripcion:
          "Tu período de prueba o suscripción finalizó. Activá un plan para seguir usando la calculadora.",
      };
    }
  }

  const plan =
    usuario.suscripcion === "basica"
      ? { nombre: "Básico", color: "bg-blue-100 text-blue-800" }
      : usuario.suscripcion === "completa"
      ? { nombre: "Completo", color: "bg-purple-100 text-purple-800" }
      : { nombre: "Gratuito", color: "bg-gray-100 text-gray-700" };

  const guardarCambios = async () => {
    try {
      await updateDoc(doc(db, "usuarios", usuario.uid), datos);
      setEditando(false);
      alert("✅ Datos actualizados correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar los datos");
    }
  };

  return (
    <section className="max-w-5xl mx-auto py-10 px-4">
      {/* Encabezado y estado */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 border border-gray-200">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <FaUserCircle className="text-blue-700 text-6xl mb-2" />
          <h2 className="text-2xl font-bold text-blue-800">
            {usuario.displayName || usuario.nombre || "Usuario"}
          </h2>
          <p className="text-gray-600 text-sm">{usuario.email}</p>
        </div>
        <div className="text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
            {estadoCuenta.icono}
            <h3 className={`text-lg font-semibold ${estadoCuenta.color}`}>
              {estadoCuenta.texto}
            </h3>
          </div>
          <p className="text-sm text-gray-600">{estadoCuenta.descripcion}</p>
        </div>
      </div>

      {/* Grilla: plan + progreso */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Plan */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">
            ⚡ Detalles de tu suscripción
          </h3>
          <p className="mb-2">
            <strong>Plan actual:</strong>{" "}
            <span className={`px-2 py-1 rounded-md ${plan.color}`}>
              {plan.nombre}
            </span>
          </p>
          <p>
            <strong>Fecha de pago:</strong> {formatearFecha(usuario.fechaPago)}
          </p>
          <p>
            <strong>Fecha de expiración:</strong>{" "}
            {formatearFecha(usuario.fechaExpiracion)}
          </p>
        </div>

        {/* Progreso */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border border-blue-200 text-center flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            📈 Tu progreso
          </h3>
          <p className="text-6xl font-bold text-blue-800 mb-1">
            {usuario.presupuestosGenerados || 0}
          </p>
          <p className="text-gray-600 text-sm">
            Presupuestos generados hasta el momento
          </p>
        </div>
      </div>

      {/* Información editable */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-700">
            📋 Información general
          </h3>
          <button
            onClick={() => (editando ? guardarCambios() : setEditando(true))}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            {editando ? <FaSave /> : <FaEdit />}
            {editando ? "Guardar" : "Editar"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          {[
            ["Provincia", "provincia"],
            ["Ciudad", "ciudad"],
            ["Grado", "grado"],
            ["Experiencia", "experiencia"],
            ["Modalidad de trabajo", "modalidadTrabajo"],
            ["Especialidad", "especialidad"],
          ].map(([label, key]) => (
            <div key={key}>
              <strong>{label}:</strong>{" "}
              {editando ? (
                <input
                  type="text"
                  value={datos[key]}
                  onChange={(e) =>
                    setDatos((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="ml-1 border rounded px-2 py-1 text-sm w-full sm:w-auto"
                />
              ) : (
                <span className="ml-1">{datos[key] || "—"}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Los datos de tu cuenta se actualizan automáticamente según tu actividad.
      </p>
    </section>
  );
}
