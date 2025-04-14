// Reglamentacion.jsx – búsqueda y filtrado sin tapa ni botón "ver"
import { useState } from "react";

const documentosAEA = [
  {
    categoria: "Generalidades y principios",
    items: [
      { codigo: "90364-0", detalle: "Guía de Aplicación", edicion: 2006 },
      { codigo: "90364-1", detalle: "Alcance, Objeto y Principios Fundamentales", edicion: 2006 },
      { codigo: "90364-2", detalle: "Definiciones", edicion: 2006 },
    ]
  },
  {
    categoria: "Protecciones y seguridad",
    items: [
      { codigo: "90364-4", detalle: "Protecciones para Preservar la Seguridad", edicion: 2006 },
      { codigo: "91140", detalle: "Protección contra los Choques Eléctricos", edicion: 2021 },
      { codigo: "61201", detalle: "Uso de las tensiones límites convencionales de contacto", edicion: 2021 },
    ]
  },
  {
    categoria: "Ambientes especiales",
    items: [
      { codigo: "7-701", detalle: "Cuartos de Baño", edicion: 2012 },
      { codigo: "7-702", detalle: "Piscinas y Fuentes ornamentales", edicion: 2018 },
      { codigo: "7-710", detalle: "Locales para usos Médicos", edicion: 2024 },
    ]
  },
  {
    categoria: "Automatización y transporte",
    items: [
      { codigo: "7-780", detalle: "Automatización de Edificios", edicion: 2011 },
      { codigo: "90364-7-791 T1", detalle: "Ascensores de pasajeros", edicion: 2018 },
      { codigo: "90364-7-791 T2", detalle: "Escaleras mecánicas, rampas y más", edicion: 2020 },
    ]
  },
  {
    categoria: "Puesta a tierra",
    items: [
      { codigo: "95501-2", detalle: "Guía de mediciones de puesta a tierra", edicion: 2021 },
      { codigo: "95501-4", detalle: "Instalaciones >1kV", edicion: 2016 },
      { codigo: "95501-8", detalle: "Uso eléctrico en vía pública ≤1kV", edicion: 2016 },
    ]
  },
  {
    categoria: "Corrientes de cortocircuito",
    items: [
      { codigo: "90865-1", detalle: "Cálculo de los efectos térmicos", edicion: 2016 },
      { codigo: "90865-2", detalle: "Ejemplos de cálculo", edicion: 2019 },
      { codigo: "60909-0", detalle: "Cálculo de corrientes trifásicas de corto", edicion: 2021 },
    ]
  },
  {
    categoria: "Protección contra rayos",
    items: [
      { codigo: "92305-1", detalle: "Principios Generales", edicion: 2015 },
      { codigo: "92305-2", detalle: "Evaluación del Riesgo", edicion: 2015 },
      { codigo: "92305-3", detalle: "Daño físico a estructuras", edicion: 2015 },
    ]
  },
  {
    categoria: "Trabajos con tensión y señalización",
    items: [
      { codigo: "95702", detalle: "Trabajos con Tensión en instalaciones >1kV", edicion: 2021 },
      { codigo: "95703", detalle: "Alumbrado Público", edicion: 2018 },
      { codigo: "95704", detalle: "Señalización de instalaciones eléctricas", edicion: 2011 },
    ]
  }
];

export function Reglamentacion() {
  const [busqueda, setBusqueda] = useState("");

  const documentosFiltrados = documentosAEA.map((grupo) => ({
    ...grupo,
    items: grupo.items.filter((doc) =>
      `${doc.codigo} ${doc.detalle}`.toLowerCase().includes(busqueda.toLowerCase())
    )
  })).filter((grupo) => grupo.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Reglamentaciones AEA</h1>

      <input
        type="text"
        placeholder="Buscar por código o titulo..."
        className="w-full p-2 border border-gray-300 rounded mb-8"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {documentosFiltrados.length === 0 ? (
        <p className="text-gray-600">No se encontraron resultados.</p>
      ) : (
        documentosFiltrados.map((grupo, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{grupo.categoria}</h2>
            <ul className="list-disc pl-6 space-y-1">
              {grupo.items.map((doc) => (
                <li key={doc.codigo}>
                  <strong>{doc.codigo}</strong> ({doc.edicion}): {doc.detalle}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}