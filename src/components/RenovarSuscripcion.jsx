import { useMemo } from "react";

export default function RenovarSuscripcion({ usuario }) {
  const { mostrar, dias, fecha } = useMemo(() => {
    if (!usuario?.fechaExpiracion) return { mostrar: false };
    const expiracion = usuario.fechaExpiracion.toDate
      ? usuario.fechaExpiracion.toDate()
      : new Date(usuario.fechaExpiracion);

    const ahora = new Date();
    const diffMs = expiracion - ahora;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      mostrar: diffDias <= 7 && diffDias > 0,
      dias: diffDias,
      fecha: expiracion,
    };
  }, [usuario]);

  if (!mostrar) return null;

  return (
    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
      <p className="text-yellow-700 mb-2">
        ⚠️ Tu suscripción vence el <strong>{fecha.toLocaleDateString()}</strong>{" "}
        (faltan {dias} días).
      </p>
      <button
        onClick={() => (window.location.href = "/renovar")}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        🔄 Renovar suscripción
      </button>
    </div>
  );
}
