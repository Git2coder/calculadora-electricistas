// Comentarios.jsx – formulario básico con FormSubmit
export function Comentarios() {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">💬 Dejanos tu comentario</h2>
        <p className="text-gray-600 mb-6">
          Si te fue útil la calculadora o querés dejar alguna sugerencia, conocer tu opinión nos ayuda a crecer.
        </p>
  
        <form
          action="https://formsubmit.co/calculadoradepresupuesto@gmail.com"
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="box" />
  
          <input
            type="text"
            name="nombre"
            placeholder="Tu nombre"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="comentario"
            placeholder="Escribí tu comentario..."
            required
            className="w-full p-2 border rounded h-32"
          ></textarea>
  
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enviar comentario
          </button>
        </form>
      </div>
    );
  }
  