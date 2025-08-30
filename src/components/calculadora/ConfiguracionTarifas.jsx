import React from "react";

const ConfiguracionTarifas = ({
  tarifaHoraria,
  setTarifaHoraria,
  costoConsulta,
  setCostoConsulta,
  onOpenModal,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">⚙️ Configuración de Tarifas</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          onClick={onOpenModal}
        >
          Calcular Tarifa
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          Tarifa Horaria ($/h):
          <input
            type="number"
            className="w-full p-2 border rounded mt-1"
            value={tarifaHoraria}
            onChange={(e) => setTarifaHoraria(parseFloat(e.target.value))}
          />
        </label>
        <label className="block">
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
  );
};

export default ConfiguracionTarifas;
