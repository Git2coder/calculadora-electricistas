// Noticias.jsx – con enlaces a los artículos informativos
export function Noticias() {
  const articulos = [
    {
      titulo: "Nación busca normalizar las deudas de las distribuidoras y cooperativas eléctricas con CAMMESA",
      resumen: "El Poder Ejecutivo Nacional aprobó un plan para regularizar las deudas por US$ 1.100 millones.",
      fecha: "18/03/2025",
      enlace: "https://www.mejorenergia.com.ar/noticias/2025/03/18/3908-nacion-busca-normalizar-las-deudas-de-las-distribuidoras-y-cooperativas-electricas-con-cammesa"
    },
    {
      titulo: "A partir de octubre 2025 entra en vigencia el QR como elemento identificador",
      resumen: "Aquellos productos que fueron certificados con el régimen anterior (RES 169) podrán seguir utilizando el logo S hasta el 1° de octubre o hasta el 26 de febrero de 2026.",
      fecha: "13/03/2025",
      enlace: "https://apseargentina.org/desde-el-1-de-octubre-de-2025-entra-en-vigencia-el-qr-como-elemento-identificador-de-productos-con-seguridad-electrica/"
    },
    {
      titulo: "El Fin de la Certificación Eléctrica Obligatoria",
      resumen: "El gobierno argentino dio un paso audaz: eliminar la certificación eléctrica obligatoria para productos importados que cumplan normas internacionales.",
      fecha: "10/03/2025",
      enlace: "https://www.somosjujuy.com.ar/opinion/el-fin-certificacion-electrica-obligatoria-argentina-oportunidades-riesgos-desafio-seguridad-n101151"
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Noticias del Sector Eléctrico</h1>
      <ul className="space-y-6">
        {articulos.map((articulo, idx) => (
          <li key={idx} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <p className="text-sm text-gray-500 mb-1">{articulo.fecha}</p>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">{articulo.titulo}</h2>
            <p className="text-gray-700 mb-3">{articulo.resumen}</p>
            <a
              href={articulo.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              Leer artículo completo
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}