// src/components/admin/Estadisticas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF"];

const Estadisticas = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [presupuestosTotales, setPresupuestosTotales] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);

      // 🔹 Supongamos que cada usuario tiene un campo presupuestosGenerados
      const totalPresupuestos = data.reduce(
        (acc, u) => acc + (u.presupuestosGenerados || 0),
        0
      );
      setPresupuestosTotales(totalPresupuestos);
    };

    fetchData();
  }, []);

  // 📊 Métricas
    const totalUsuarios = usuarios.length;

    // Filtramos solo usuarios con valorBoca válido (número > 0)
    const usuariosConBoca = usuarios.filter((u) => typeof u.valorBoca === "number" && u.valorBoca > 0);

    const valorBocaPromedio = usuariosConBoca.length > 0
    ? usuariosConBoca.reduce((acc, u) => acc + u.valorBoca, 0) / usuariosConBoca.length
    : 0;

    // Porcentaje de los que conocen su tarifa
    const totalConocenTarifa = usuarios.filter((u) => u.conoceTarifa === true).length;
    const porcentajeConocenTarifa = ((totalConocenTarifa / (totalUsuarios || 1)) * 100).toFixed(1);


  // 🔸 Distribución por especialidad
  const especialidadData = Object.values(
    usuarios.reduce((acc, u) => {
      if (u.especialidad) {
        acc[u.especialidad] = acc[u.especialidad] || { name: u.especialidad, value: 0 };
        acc[u.especialidad].value++;
      }
      return acc;
    }, {})
  );

  // 🔸 Modalidad de trabajo
  const modalidadData = Object.values(
    usuarios.reduce((acc, u) => {
      if (u.modalidadTrabajo) {
        acc[u.modalidadTrabajo] = acc[u.modalidadTrabajo] || { name: u.modalidadTrabajo, value: 0 };
        acc[u.modalidadTrabajo].value++;
      }
      return acc;
    }, {})
  );

  // 🔸 Provincias más activas
  const provinciasData = Object.values(
    usuarios.reduce((acc, u) => {
      if (u.provincia) {
        acc[u.provincia] = acc[u.provincia] || { name: u.provincia, value: 0 };
        acc[u.provincia].value++;
      }
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value).slice(0, 5);

  // 🔸 Top 5 usuarios por presupuestos
  const topUsuarios = [...usuarios]
    .sort((a, b) => (b.presupuestosGenerados || 0) - (a.presupuestosGenerados || 0))
    .slice(0, 5)
    .map((u) => ({
      name: u.nombre || u.email,
      value: u.presupuestosGenerados || 0,
    }));

  return (
    <div className="p-6 space-y-8">
      {/* 📊 Tarjetas superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-4 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold text-blue-800">Usuarios Totales</h3>
          <p className="text-2xl font-bold text-blue-900">{totalUsuarios}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold text-green-800">Valor Boca Promedio</h3>
          <p className="text-2xl font-bold text-green-900">${valorBocaPromedio.toFixed(0)}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold text-purple-800">Presupuestos Totales</h3>
          <p className="text-2xl font-bold text-purple-900">{presupuestosTotales}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl shadow text-center">
            <h3 className="text-lg font-semibold text-yellow-800">Conocen su tarifa</h3>
            <p className="text-2xl font-bold text-yellow-900">{porcentajeConocenTarifa}%</p>
        </div>
      </div>

      {/* 🔹 Gráfico circular por especialidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Distribución por Especialidad</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={especialidadData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {especialidadData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* 🔹 Modalidad de trabajo */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Modalidad de Trabajo</h2>
          <BarChart width={400} height={300} data={modalidadData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>

      {/* 🔹 Provincias más activas */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Provincias más activas</h2>
        <BarChart width={600} height={300} data={provinciasData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </div>

      {/* 🔹 Top 5 usuarios */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Top 5 Usuarios por Presupuestos</h2>
        <BarChart width={600} height={300} data={topUsuarios}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#ff7300" />
        </BarChart>
      </div>
    </div>
  );
};

export default Estadisticas;
