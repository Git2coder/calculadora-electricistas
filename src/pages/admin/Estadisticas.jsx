// src/components/Estadisticas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Paleta pastel consistente
const PALETTE = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#22d3ee", "#f87171", "#f59e0b"];
const CARD_CLASS = "bg-white p-6 rounded-xl shadow space-y-6";

const toNumber = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const promedio = (arr) => {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

// Buckets para tarifas horarias (en ARS)
const bucketTarifa = (n) => {
  if (n == null) return null;
  if (n <= 5000) return "≤ $5.000";
  if (n <= 10000) return "$5.001–$10.000";
  if (n <= 15000) return "$10.001–$15.000";
  if (n <= 20000) return "$15.001–$20.000";
  if (n <= 30000) return "$20.001–$30.000";
  if (n <= 50000) return "$30.001–$50.000";
  return "≥ $50.001";
};

const Estadisticas = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Usuarios
      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      const usuariosData = usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsuarios(usuariosData);

      // Presupuestos (si existe la colección)
      try {
        const presupSnap = await getDocs(collection(db, "presupuestos"));
        const presupData = presupSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPresupuestos(presupData);
      } catch {
        setPresupuestos([]); // fallback
      }
    };
    fetchData();
  }, []);

  // ===== Métricas superiores =====
  const totalUsuarios = usuarios.length;

  const valorBocaPromedio = useMemo(() => {
    const valores = usuarios
      .map((u) => toNumber(u.valorBoca))
      .filter((v) => v != null);
    return Math.round(promedio(valores));
  }, [usuarios]);

  const totalPresupuestos = useMemo(() => {
    // Si existe colección presupuestos, úsala; si no, suma por usuario
    if (presupuestos.length) return presupuestos.length;
    return usuarios.reduce((acc, u) => acc + (toNumber(u.presupuestosGenerados) || 0), 0);
  }, [presupuestos, usuarios]);

  const porcentajeConocenTarifa = useMemo(() => {
    if (!totalUsuarios) return 0;
    const cnt = usuarios.filter((u) => u.conoceTarifa === true).length;
    return Math.round((cnt * 100) / totalUsuarios);
  }, [usuarios, totalUsuarios]);

  // ===== Métricas secundarias =====
  const tarifaHorariaPromedio = useMemo(() => {
    const valores = usuarios
      .map((u) => toNumber(u.tarifaHoraria))
      .filter((v) => v != null && v > 0);
    return Math.round(promedio(valores));
  }, [usuarios]);

  const visitaPromedio = useMemo(() => {
    const valores = usuarios
      .map((u) => toNumber(u.costoConsulta))
      .filter((v) => v != null && v >= 0);
    return Math.round(promedio(valores));
  }, [usuarios]);

  const porcentajeUsuariosConTarifa = useMemo(() => {
    if (!totalUsuarios) return 0;
    const cnt = usuarios.filter((u) => toNumber(u.tarifaHoraria) != null).length;
    return Math.round((cnt * 100) / totalUsuarios);
  }, [usuarios, totalUsuarios]);

  // ===== Datos para charts =====

  // Distribución de tarifas horarias (histograma por buckets)
  const tarifasBuckets = useMemo(() => {
    const counts = {};
    usuarios.forEach((u) => {
      const n = toNumber(u.tarifaHoraria);
      const bucket = bucketTarifa(n);
      if (!bucket) return;
      counts[bucket] = (counts[bucket] || 0) + 1;
    });
    // Mantener orden lógico
    const order = ["≤ $5.000", "$5.001–$10.000", "$10.001–$15.000", "$15.001–$20.000", "$20.001–$30.000", "$30.001–$50.000", "≥ $50.001"];
    return order
      .filter((label) => counts[label]) // elimina buckets vacíos
      .map((label) => ({ name: label, value: counts[label] }));
  }, [usuarios]);

  // Especialidad (pie)
  const especialidadData = useMemo(() => {
    const acc = {};
    usuarios.forEach((u) => {
      const key = (u.especialidad || "Sin definir").trim();
      acc[key] = (acc[key] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [usuarios]);

  // Modalidad de trabajo (barras)
  const modalidadData = useMemo(() => {
    const acc = {};
    usuarios.forEach((u) => {
      const key = (u.modalidadTrabajo || "Sin definir").trim();
      acc[key] = (acc[key] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [usuarios]);

  // Provincias más activas (top N o todas)
  const provinciasData = useMemo(() => {
    const acc = {};
    usuarios.forEach((u) => {
      const key = (u.provincia || "Sin definir").trim();
      acc[key] = (acc[key] || 0) + 1;
    });
    return Object.entries(acc)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [usuarios]);

  // Top 5 usuarios por presupuestosGenerados
  const topUsuarios = useMemo(() => {
    const arr = usuarios
      .map((u) => ({
        name: u.nombre || u.displayName || "Sin nombre",
        value: toNumber(u.presupuestosGenerados) || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    return arr;
  }, [usuarios]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center text-blue-700">
          📊 Dashboard de Estadísticas
        </h1>

        {/* === Tarjetas superiores (4 / 2 en móvil) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">Usuarios Totales</div>
            <div className="text-3xl font-bold text-blue-600">{totalUsuarios}</div>
          </div>
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">Valor Boca Promedio</div>
            <div className="text-3xl font-bold text-green-600">
              ${valorBocaPromedio.toLocaleString("es-AR")}
            </div>
          </div>
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">Presupuestos Totales</div>
            <div className="text-3xl font-bold text-purple-600">{totalPresupuestos}</div>
          </div>
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">% que conocen su tarifa</div>
            <div className="text-3xl font-bold text-orange-500">{porcentajeConocenTarifa}%</div>
          </div>
        </div>

        {/* === Métricas secundarias (3 en desktop / 1 en móvil) === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">Tarifa horaria promedio</div>
            <div className="text-2xl font-bold text-blue-500">
              ${tarifaHorariaPromedio.toLocaleString("es-AR")}
            </div>
          </div>
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">Visita promedio</div>
            <div className="text-2xl font-bold text-emerald-500">
              ${visitaPromedio.toLocaleString("es-AR")}
            </div>
          </div>
          <div className={CARD_CLASS}>
            <div className="text-gray-600 font-semibold">% usuarios con tarifa guardada</div>
            <div className="text-2xl font-bold text-fuchsia-500">{porcentajeUsuariosConTarifa}%</div>
          </div>
        </div>

        {/* === Distribución de tarifas horarias === */}
        <div className={CARD_CLASS}>
          <h3 className="text-xl font-semibold text-center">Distribución de tarifas horarias</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={tarifasBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* === Especialidad + Modalidad (2 columnas) === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={CARD_CLASS}>
            <h3 className="text-xl font-semibold text-center">Distribución por especialidad</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={especialidadData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {especialidadData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={CARD_CLASS}>
            <h3 className="text-xl font-semibold text-center">Modalidad de trabajo</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={modalidadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill={PALETTE[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === Provincias más activas === */}
        <div className={CARD_CLASS}>
          <h3 className="text-xl font-semibold text-center">Provincias más activas</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={provinciasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[2]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* === Top 5 usuarios === */}
        <div className={CARD_CLASS}>
          <h3 className="text-xl font-semibold text-center">Top 5 usuarios (presupuestos generados)</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topUsuarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[3]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
