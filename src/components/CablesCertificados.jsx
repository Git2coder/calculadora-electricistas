import React, { useState } from "react";

const CablesCertificados = () => {
  const [tab, setTab] = useState("unipolares");
  const [search, setSearch] = useState("");

  const marcas = {
    unipolares: [
      "2C",
      "ALCABLE",
      "ARGENPLAS",
      "AYAN CABLES",
      "BARROW",
      "CABLES FB ( EFEBE )",
      "CAELBI",
      "CAVINAP",
      "CEARCA",
      "CECAM CONDUCTORES ELÉCTRICOS",
      "CEDAM",
      "CETYA",
      "CIMET",
      "COBRHIL",
      "CODESIL",
      "COELPLA",
      "CONDUCTRES trefilcon",
      "CONDUFLEX",
      "ELECTRIC POWER CONDUCTORS",
      "ELECTROMOL",
      "ELEPHANT",
      "EPUYEN",
      "FADE-CE",
      "FLEXTON",
      "FONSECA",
      "FORTFLEX",
      "IKHANA",
      "INDUSTRIAS ERPLA",
      "INDUSTRIAS M.H.",
      "K − HALUX",
      "KALOFLEX − KALOBASIC ( KALOP )",
      "LEDUCOM",
      "MARLEW",
      "MARVIC",
      "MERCOLUZ ( MAGNOLUZ )",
      "MICROTEC",
      "NETFLEX ( NET3 )",
      "NEUTROLUZ",
      "PETTOROSSI EMYSFIAMA",
      "PLASTIX CF ( IMSA )",
      "PRYSMIAN",
      "R−2000",
      "RICHI",
      "RINALPLAST",
      "SUMALUX",
      "TREFILCON",
      "UPERCAB",
      "WENTINCK CONDUCTORES",

    ],
    taller: [
      "ALCABLE",
      "ALHER",
      "ARGENPLAS",
      "CABLES ARMADOS ( TECNOCABLES )",
      "CEDAM",
      "CETYA",
      "COBRHIL",
      "CODESIL",
      "COELPLA",
      "CONDUCABLE",
      "CR",
      "ELECTRIC POWER CONDUCTORS",
      "ELEPHANT",
      "CONDUCTRES",
      "FLEXI − CAMP",
      "FLEXTON",
      "FONSECA",

      "INDUSTRIAS ERPLA",
      "INDUSTRIAS M.H.",
      "LEDUCOM",
      "LVH",
      "MARLEW",
      "MICROTEC",
      "MR CONJUNTOS ELECTRICOS",
      "NETFLEX ( NET3 )",
      "PETTOROSSI EMYSFLEX",
      "PLASTIX ( IMSA )",
      "PRYSMIAN",
      "R−2000",
      "RICHI",
      "SUMALUX",
      "TALLER FLEX ( KALOP )",
      "TREFILCON",
      "WENTINCK CONDUCTORES",

    ],
    subterraneo: [
      "2C",
      "AFLAMEX",
      "ARGENPLAS",
      "AYAN CABLES",
      "CABLES FB ( EFEBE )",
      "CAVINAP",
      "CECAM CONDUCTORES ELÉCTRICOS",
      "CEDASEG+FLEX ( CEDAM )",
      "CETENET®−XL ( CEARCA )",
      "CETYA",
      "CIMET ( DUROLITE −TERMOLITE )",
      "COBRHIL",
      "CONDUCTRES",
      "CONDUFLEX",
      "ELECTRIC POWER CONDUCTORS",
      "ELEPHANT",
      "EPUYEN",
      "FONSECA",
      "FUNTEX",
      "IKHANA",
      "IMSA",
      "INDUSTRIAS ERPLA",
      "INDUSTRIAS M.H.",
      "KALOFLEX ENERGIA ( KALOP )",
      "MARLEW",
      "MAR−VIC",
      "MERCOLUZ ( MAGNOLUZ )",
      "NETFLEX ( NET 3 )",
      "NEUTROLUZ",
      "PETTOROSSI POTEMYS NOPRIN",
      "PRYSMIAN",
      "RINALPLAST",
      "SUMALUX",
      "TREFI (TREFILCON)",
      "UPERCAB",
      "WENTINCK CONDUCTORES",

    ],
  };

  const marcasFiltradas = marcas[tab].filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div className="max-w-6xl mx-auto p-6">

    <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-2 text-center">
      Cables certificados IRAM
    </h1>

    <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
      Listado actualizado de fabricantes con cables certificados según norma IRAM. Fuente:{" "}
      <a
        href="https://www.apseargentina.org"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        APSE
      </a>{" "}
      — relevado al <strong>30 de agosto de 2024</strong>.
    </p>

    {/* 🟨 Descargo */}
    <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6 text-sm text-gray-700 dark:text-gray-200 rounded">
      <p>
          <strong>Nota importante:</strong> La información se recopila de fuentes públicas y se
          comparte únicamente con fines informativos. APSE informa que las marcas de cables certificados han sido
          suministradas por los <strong>organismos de certificación</strong> que
          intervinieron en su obtención. En esta lista no se indican las
          categorías de cables que cada marca ha certificado, el organismo de
          certificación que intervino ni la fecha de vigencia.
        </p>
    </div>

    {/* 🔹 Pestañas */}
    <div className="flex justify-center gap-2 border-b border-gray-300 dark:border-gray-700 mb-4">
      {[
        { id: "unipolares", label: "Unipolares" },
        { id: "taller", label: "Tipo Taller" },
        { id: "subterraneo", label: "Tipo Subterráneo" },
      ].map((t) => (
        <button
          key={t.id}
          className={`px-4 py-2 font-semibold border-b-2 transition 
            ${tab === t.id
              ? "border-blue-600 text-blue-700 dark:text-blue-300"
              : "border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          onClick={() => {
            setTab(t.id);
            setSearch("");
          }}
        >
          {t.label}
        </button>
      ))}
    </div>

    {/* 🔍 Buscador */}
    <div className="flex justify-center mb-4">
      <input
        type="text"
        placeholder="Buscar marca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full max-w-xs 
        bg-white dark:bg-gray-800 
        text-gray-800 dark:text-gray-200
        focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
      />
    </div>

    {/* 🔹 Listado de marcas */}
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-5 mb-10">
      {marcasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6">
          {marcasFiltradas.map((marca, i) => (
            <div
              key={i}
              className="border-b border-gray-100 dark:border-gray-700 pb-1 
              text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {marca}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 italic py-6">
          No se encontraron resultados
        </p>
      )}
    </div>

    {/* 🔹 GUÍA */}
    <section className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-5 mb-8">
      <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
        Cómo verificar un cable certificado
      </h2>

      <ol className="list-decimal ml-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
        <li>Solicite al fabricante o vendedor el certificado correspondiente.</li>

        <li>
          Verifique que el <strong>embalaje</strong> contenga la siguiente información:
          <ul className="list-disc ml-6 mt-1">
            <li>Organismo certificador y marca S.</li>
            <li>País de origen.</li>
            <li>Marca / razón social y modelo.</li>
            <li>Domicilio del responsable legal.</li>
          </ul>
        </li>

        <li>
          Compruebe el marcado del cable:
          <div className="bg-white dark:bg-gray-800 p-3 mt-2 rounded-md border border-gray-300 dark:border-gray-600 text-xs font-mono text-gray-700 dark:text-gray-300">
            a) Cable unipolar 1.5 mm² <br />
            {"<SELLO> <MARCA SC> MARCA – INDUSTRIA ARGENTINA – 450/750 V 1.5 mm²"}
            <br />
            b) Cable unipolar 2.5 mm² <br />
            {"<SELLO> <MARCA SC> MARCA – INDUSTRIA ARGENTINA – 450/750 V 2.5 mm²"}
          </div>
        </li>
      </ol>
    </section>

    {/* 🔹 PDF */}
    <div className="text-center mt-6">
      <a
        href="/docs/30-8-24-APSE-Listado-de-cables-certificados.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-700 dark:bg-blue-800 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 dark:hover:bg-blue-700 transition"
      >
        📄 Ver listado completo (PDF oficial)
      </a>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Archivo publicado por APSE — “Listado de Cables Certificados” (30/08/2024)
      </p>
    </div>

  </div>
);

};

export default CablesCertificados;
