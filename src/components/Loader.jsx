export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">

      {/* Contenedor del logo */}
      <div className="relative">
        <img
          src="/icons/Presupuesto1.png"
          alt="Presupuesto+"
          className="
              h-20 w-20 object-contain animate-logoPulse
              dark:brightness-125 dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]
          "
        />


        {/* Glow suave alrededor */}
        <div className="absolute inset-0 rounded-full blur-2xl 
                        bg-blue-500/20 dark:bg-blue-400/20 
                        animate-logoGlow">
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mt-4 text-sm animate-pulse">
        <b>Cargando tu herramienta...</b>
      </p>
    </div>
  );
}
