import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Plus, Minus, Save, Coins } from "lucide-react";
import { ShieldHalf, Sword, Swords, Medal } from "lucide-react";

export function Jornales() {
  const [jornales, setJornales] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const ref = doc(db, "jornales", "valores");
      const snap = await getDoc(ref);
      if (snap.exists()) setJornales(snap.data());
    };
    fetchData();
  }, []);

  if (!jornales) return <p className="text-gray-600">Cargando...</p>;

  const handleChange = (campo, valor) => {
    setJornales({ ...jornales, [campo]: valor });
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      const db = getFirestore();
      await setDoc(doc(db, "jornales", "valores"), {
        ...jornales,
        fechaActualizacion: new Date(),
      });
      setMensaje("✅ Guardado con éxito");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("Error guardando:", err);
      setMensaje("❌ Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const roles = [
    {
      key: "diasAyudante",
      nombre: "Ayudante",
      icono: <ShieldHalf size={20} className="text-green-600 inline-block mr-1" />,
    },
    {
      key: "diasMedioOficial",
      nombre: "Medio Oficial",
      icono: <Sword size={20} className="text-blue-500 inline-block mr-1" />,
    },
    {
      key: "diasOficial",
      nombre: "Oficial",
      icono: <Swords size={20} className="text-red-500 inline-block mr-1" />,
    },
    {
      key: "diasEspecializado",
      nombre: "Especializado",
      icono: <Medal size={20} className="text-yellow-500 inline-block mr-1" />,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-black-700 flex items-center gap-2 mb-4">
        <Coins size={22} /> Gestión de Jornales
      </h2>

      {/* CBT */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700">
          Canasta Básica Total (CBT)
        </label>
        <input
          type="number"
          value={jornales.CBT}
          onChange={(e) => handleChange("CBT", parseFloat(e.target.value))}
          className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300 mt-1"
        />
      </div>

      {/* Roles */}
      <div className="grid grid-cols-1 gap-4">
        {roles.map((r) => (
          <div
            key={r.key}
            className="flex justify-between items-center border rounded-lg p-3 bg-gray-50 shadow-sm"
          >
            {/* Icono + nombre */}
            <span className="font-medium flex items-center gap-1">
              {r.icono} {r.nombre}
            </span>

            {/* Botones + y - con días centrados */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleChange(r.key, Math.max(1, jornales[r.key] - 1))
                }
                className="p-1 bg-blue-100 rounded hover:bg-green-200"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-semibold">
                {jornales[r.key]}
              </span>
              <button
                onClick={() => handleChange(r.key, jornales[r.key] + 1)}
                className="p-1 bg-blue-100 rounded hover:bg-green-200"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Valor calculado */}
            <span className="text-sm text-gray-600 w-28 text-right">
              ${(jornales.CBT / jornales[r.key]).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Guardar */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={18} /> {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        {mensaje && <span className="text-sm">{mensaje}</span>}
      </div>
    </div>
  );
}
