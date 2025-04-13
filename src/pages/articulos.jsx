// Articulos.jsx
export function Articulos() {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Artículos Técnicos</h1>
        <ul className="space-y-4">
          <li>
            <h2 className="text-lg font-semibold">¿Qué es un interruptor diferencial?</h2>
            <p>Dispositivo que protege contra contactos indirectos. Se instala aguas abajo de una protección térmica.</p>
          </li>
          <li>
            <h2 className="text-lg font-semibold">Tipos de canalizaciones eléctricas</h2>
            <p>Diferencias entre caños rígidos, flexibles, preentubados y canaletas. Ventajas y desventajas.</p>
          </li>
        </ul>
      </div>
    );
  }