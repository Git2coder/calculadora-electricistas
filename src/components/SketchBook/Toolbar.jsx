import React from "react";

export default function Toolbar({ tool, setTool, hasWalls }) {
  const buttonStyle = (name) => ({
    padding: "8px 12px",
    marginRight: 6,
    background: tool === name ? "#2563eb" : "#e5e7eb",
    color: tool === name ? "white" : "black",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  });

  return (
    <div style={{ marginBottom: 12 }}>

      {/* 🧱 Dibujar recinto */}
      <button
        style={buttonStyle("wall")}
        onClick={() => setTool("wall")}
      >
        🧱 Recinto
      </button>

      {/* 🚪 Puerta */}
      <button
        style={buttonStyle("door")}
        onClick={() => setTool("door")}
        disabled={!hasWalls}
      >
        🚪 Puerta
      </button>

      {/* 🪟 Ventana */}
      <button
        style={buttonStyle("window")}
        onClick={() => setTool("window")}
        disabled={!hasWalls}
      >
        🪟 Ventana
      </button>

      {/* 🔌 Toma */}
      <button
        style={buttonStyle("toma")}
        onClick={() => setTool("toma")}
        disabled={!hasWalls}
      >
        🔌 Toma
      </button>

      {/* 💡 Luz */}
      <button
        style={buttonStyle("luz")}
        onClick={() => setTool("luz")}
        disabled={!hasWalls}
      >
        💡 Luz
      </button>

      {/* 🎛 Llave */}
      <button
        style={buttonStyle("llave")}
        onClick={() => setTool("llave")}
        disabled={!hasWalls}
      >
        🎛 Llave
      </button>

      {/* 📦 Tablero */}
      <button
        style={buttonStyle("tablero")}
        onClick={() => setTool("tablero")}
        disabled={!hasWalls}
      >
        📦 Tablero
      </button>

      {/* 🔗 Canalización */}
      <button
        style={buttonStyle("pipe")}
        onClick={() => setTool("pipe")}
        disabled={!hasWalls}
      >
        🔗 Canalizar
      </button>

      {/* Cursor */}
      <button
        style={{ marginLeft: 12 }}
        onClick={() => setTool(null)}
      >
        Seleccionar
      </button>

    </div>
  );
}