import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import InputMoneda from "./InputMoneda";
import { TooltipInfo } from "./TooltipInfo";

export default function ModalTarifa({ setTarifaHoraria, onClose }) {
  const [modo, setModo] = useState("simple");

  const [gastosFijos, setGastosFijos] = useState(0);
  const [gastosVariables, setGastosVariables] = useState(0);

  const [ingresoDeseado, setIngresoDeseado] = useState(0);
  const [gastosFijos2, setGastosFijos2] = useState(0);
  const [gastosVariables2, setGastosVariables2] = useState(0);

  const [horasPorDia, setHorasPorDia] = useState(8);
  const [horasCobrables, setHorasCobrables] = useState(6);
  const [diasTrabajados, setDiasTrabajados] = useState(20);

  const [resultado, setResultado] = useState(null);
  const [ajuste, setAjuste] = useState(0);

  const resultadoRef = useRef(null);

  const ganancia = 1.67;

  useEffect(() => {
    setResultado(null);
    setAjuste(0);
  }, [
    gastosFijos,
    gastosVariables,
    ingresoDeseado,
    gastosFijos2,
    gastosVariables2,
    horasCobrables,
    diasTrabajados
  ]);

  const calcularSimple = () => {
    const horasTrabajadas = 96;

    const total =
      (parseFloat(gastosFijos) + parseFloat(gastosVariables)) /
      horasTrabajadas;

    const sugerido = total * ganancia;

    setResultado(Math.round(sugerido));

    // 🔥 SCROLL AUTOMÁTICO
    setTimeout(() => {
      resultadoRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const calcularAvanzado = () => {
    const horasFacturables =
      parseFloat(horasCobrables) * parseFloat(diasTrabajados);

    if (horasFacturables <= 0) {
      alert("Las horas facturables deben ser mayores a 0");
      return;
    }

    const totalNecesario =
      parseFloat(ingresoDeseado) +
      parseFloat(gastosFijos2) +
      parseFloat(gastosVariables2);

    const tarifa = totalNecesario / horasFacturables;

    setResultado(Math.round(tarifa));

    // 🔥 SCROLL AUTOMÁTICO AL RESULTADO
    setTimeout(() => {
      resultadoRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const horasFacturablesPreview =
    horasCobrables * diasTrabajados;

  const eficiencia =
    horasPorDia > 0
      ? Math.round((horasCobrables / horasPorDia) * 100)
      : 0;

  const tarifaFinal =
    resultado ? Math.round(resultado * (1 + ajuste / 100)) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
      >
        {/* HEADER */}
        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-center text-blue-700 dark:text-blue-400">
            📊 Tarifa Horaria
          </h2>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setModo("simple")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                modo === "simple"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
              }`}
            >
              ⚡ Rápido
            </button>

            <button
              onClick={() => setModo("avanzado")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                modo === "avanzado"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
              }`}
            >
              💸 Profesional
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* 🟢 SIMPLE */}
          {modo === "simple" && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ingresá tus gastos mensuales
              </p>

              <div className="space-y-3">

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    🧾 Gastos fijos
                    <TooltipInfo text="Son los gastos que pagás todos los meses aunque no trabajes: alquiler, seguro, internet, etc." />
                  </div>
                  <InputMoneda value={gastosFijos} onChange={setGastosFijos} />
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    🔄 Gastos variables
                    <TooltipInfo text="Son los gastos que dependen del trabajo: combustible, viáticos, materiales menores, etc." />
                  </div>
                  <InputMoneda value={gastosVariables} onChange={setGastosVariables} />
                </div>

              </div>

              <button
                onClick={calcularSimple}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                Calcular tarifa
              </button>
            </div>
          )}

          {/* 🔵 AVANZADO */}
          {modo === "avanzado" && (
            <>
              {/* BLOQUE INGRESO */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  💰 Objetivo económico
                </p>

                <InputMoneda value={ingresoDeseado} onChange={setIngresoDeseado} />
              </div>

              {/* BLOQUE COSTOS */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Costos mensuales
                </p>

                <div className="space-y-3">

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      🧾 Gastos fijos
                      <TooltipInfo text="Ej: alquiler, seguros, servicios, impuestos. Son gastos que tenés aunque no trabajes." />
                    </div>
                    <InputMoneda value={gastosFijos2} onChange={setGastosFijos2} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      🔄 Gastos variables
                      <TooltipInfo text="Ej: combustible, materiales menores, viáticos, etc. Aumentan según la cantidad de trabajo." />
                    </div>
                    <InputMoneda value={gastosVariables2} onChange={setGastosVariables2} />
                  </div>

                </div>
              </div>

              {/* BLOQUE TIEMPO */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  ⏱️ Organización del tiempo
                </p>

                {/* HORAS POR DIA */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      Horas totales por día
                      <TooltipInfo text="Tiempo total trabajando a lo largo del dia. " />
                    </span>
                    <span className="font-semibold">{horasPorDia} hs</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={horasPorDia}
                    onChange={(e) => setHorasPorDia(parseInt(e.target.value))}
                    className="w-full mt-2 accent-blue-600"
                  />
                </div>

                {/* HORAS COBRABLES */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      Horas facturables
                      <TooltipInfo text="Son las horas cobrables por trabajo tecnico que se realizará. Descuenta pausas, intervalos de tiempos muertos por traslados o compras, etc. Siempre menor que el total." />
                    </span>
                    <span className="font-semibold">{horasCobrables} hs</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max={horasPorDia}
                    value={horasCobrables}
                    onChange={(e) => setHorasCobrables(parseInt(e.target.value))}
                    className="w-full mt-2 accent-green-600"
                  />
                </div>

                {/* DIAS */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span>📅 Días trabajados</span>
                    <span className="font-semibold">{diasTrabajados} días</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={diasTrabajados}
                    onChange={(e) => setDiasTrabajados(parseInt(e.target.value))}
                    className="w-full mt-2 accent-purple-600"
                  />
                </div>

                {/* INFO */}
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  📊 {horasFacturablesPreview} hs/mes · ⚙️ {eficiencia}%
                </div>
              </div>

              <button
                onClick={calcularAvanzado}
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                Calcular tarifa
              </button>
            </>
          )}

          {/* RESULTADO */}
          {resultado && (
            <motion.div
              ref={resultadoRef} // 👈 ESTE ES EL CAMBIO CLAVE
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 p-5 rounded-xl text-center"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Tarifa sugerida
              </p>

              <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                ${resultado.toLocaleString("es-AR")}
              </div>

              <input
                type="range"
                min="-50"
                max="100"
                value={ajuste}
                onChange={(e) => setAjuste(parseInt(e.target.value))}
                className="w-full mt-4"
              />

              <p className="text-sm mt-2">
                Ajuste: {ajuste > 0 ? "+" : ""}{ajuste}%
              </p>

              <div className="mt-3">
                <p className="text-sm">Tarifa final</p>
                <div className="text-2xl font-bold text-blue-600">
                  ${tarifaFinal.toLocaleString("es-AR")}
                </div>
              </div>

              <button
                onClick={() => {
                  setTarifaHoraria(tarifaFinal);
                  onClose();
                }}
                className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg"
              >
                ✔ Establecer tarifa
              </button>
            </motion.div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-400 dark:bg-gray-600 text-white py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}