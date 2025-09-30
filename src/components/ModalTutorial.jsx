import { useState } from "react";

export default function ModalTutorial({ videoUrl, triggerText = "❓ Ver tutorial" }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Botón que abre el modal */}
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        {triggerText}
      </button>

      {/* Modal */}
      {abierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-4 relative">
            {/* Cerrar */}
            <button
              onClick={() => setAbierto(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
            >
              ✖
            </button>

            {/* Contenido */}
            <h2 className="text-lg font-semibold mb-4">Tutorial de uso</h2>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded"
                src={videoUrl}
                title="Video tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
