import { useNavigate } from "react-router-dom";

export default function ErrorPago() {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-red-600 mb-4">¡Sucedio algo inesperado!</h1>
      <p className="mb-6">No se pudo completar tu pago o fue cancelado.</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Volver al inicio
        </button>
        <button
          onClick={() => navigate("/suscripcion")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  );
}
