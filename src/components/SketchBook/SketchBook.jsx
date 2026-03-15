import React, { useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Group, Text, Shape } from "react-konva";

const GRID_SIZE = 20;
const SNAP_ENABLED = true;

const snap = (v) =>
  SNAP_ENABLED ? Math.round(v / GRID_SIZE) * GRID_SIZE : v;

export default function SketchBookLibretaV4() {
  const stageRef = useRef(null);

  const [tool, setTool] = useState(null);
  const [roomPoints, setRoomPoints] = useState([]);
  const [drawingRoom, setDrawingRoom] = useState(false);
  const [mousePos, setMousePos] = useState(null);

  const [symbols, setSymbols] = useState([]);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [pipes, setPipes] = useState([]);

  const [openings, setOpenings] = useState([]);
  const [history, setHistory] = useState([]);

  // -------- HELPERS --------
  const getPointer = () => {
    const raw = stageRef.current.getPointerPosition();
    if (!raw) return null;
    return { x: snap(raw.x), y: snap(raw.y) };
  };

  const getHint = () => {
    switch (tool) {
      case "wall":
        return "Click para dibujar paredes. Cerrá tocando el inicio.";
      case "pipe":
        return "Seleccioná 2 símbolos para conectar.";
      case "door":
        return "Click sobre una pared para colocar puerta.";
      case "window":
        return "Click en pared. Rueda del mouse cambia ancho.";
      case "toma":
      case "luz":
      case "llave":
      case "tablero":
        return "Click para colocar múltiples elementos.";
      default:
        return "Seleccioná una herramienta.";
    }
  };

  // -------- HISTORIAL --------
  const saveHistory = () => {
    setHistory((h) => [
      ...h,
      JSON.parse(
        JSON.stringify({
          roomPoints,
          drawingRoom,
          symbols,
          pipes,
          openings,
        })
      ),
    ]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRoomPoints(last.roomPoints);
    setDrawingRoom(last.drawingRoom);
    setSymbols(last.symbols);
    setPipes(last.pipes);
    setOpenings(last.openings || []);
    setHistory(history.slice(0, -1));
  };

  const clearAll = () => {
    saveHistory();
    setRoomPoints([]);
    setDrawingRoom(false);
    setSymbols([]);
    setOpenings([]);
    setPipes([]);
    setSelectedSymbol(null);
  };

  const symbolCount = (type) =>
    symbols.filter((s) => s.type === type).length + 1;

  // -------- CLICK --------
  const handleStageClick = () => {
    const pos = getPointer();
    if (!pos) return;

    if (tool === "pipe") return;

    // WALL
    if (tool === "wall") {
      if (!drawingRoom) {
        saveHistory();
        setRoomPoints([pos]);
        setDrawingRoom(true);
        return;
      }

      const first = roomPoints[0];
      const distance = Math.hypot(pos.x - first.x, pos.y - first.y);

      if (roomPoints.length > 2 && distance < 20) {
        setDrawingRoom(false);
        setTool(null);
        return;
      }

      setRoomPoints([...roomPoints, pos]);
    }

    // SYMBOLS
    if (["toma", "luz", "llave", "tablero"].includes(tool)) {
      saveHistory();

      const prefix =
        tool === "toma"
          ? "T"
          : tool === "luz"
          ? "X"
          : tool === "llave"
          ? "S"
          : "TB";

      setSymbols([
        ...symbols,
        {
          id: Date.now(),
          x: pos.x,
          y: pos.y,
          type: tool,
          label: prefix + symbolCount(tool),
        },
      ]);
    }

    // OPENINGS
    if (tool === "door" || tool === "window") {
      if (roomPoints.length < 2) return;

      const wall = getClosestWallSegment(pos, roomPoints);
      if (!wall) return;

      saveHistory();

      setOpenings([
        ...openings,
        {
          id: Date.now(),
          x: wall.x,
          y: wall.y,
          angle: wall.angle,
          type: tool,
          flip: false,
          width: 80,
        },
      ]);
      return;
    }
  };

  const handleMouseMove = () => {
    const pos = getPointer();
    setMousePos(pos);
  };

  // -------- PIPE --------
  const handleSymbolClick = (sym) => {
    if (tool === "pipe") {
      if (!selectedSymbol) {
        setSelectedSymbol(sym);
        return;
      }

      if (selectedSymbol.id !== sym.id) {
        saveHistory();
        setPipes([
          ...pipes,
          { id: Date.now(), from: selectedSymbol.id, to: sym.id },
        ]);
      }

      setSelectedSymbol(null);
    }
  };

  const getSymbol = (id) => symbols.find((s) => s.id === id);

  function getClosestWallSegment(point, walls) {
    if (walls.length < 2) return null;

    let closest = null;
    let minDist = Infinity;

    for (let i = 0; i < walls.length; i++) {
      const a = walls[i];
      const b = walls[(i + 1) % walls.length];

      const dx = b.x - a.x;
      const dy = b.y - a.y;

      const lengthSq = dx * dx + dy * dy;
      if (lengthSq === 0) continue;

      let t =
        ((point.x - a.x) * dx + (point.y - a.y) * dy) /
        lengthSq;

      t = Math.max(0, Math.min(1, t));

      const projX = a.x + t * dx;
      const projY = a.y + t * dy;

      const dist = Math.hypot(point.x - projX, point.y - projY);

      if (dist < minDist) {
        minDist = dist;
        closest = {
          x: snap(projX),
          y: snap(projY),
          angle: Math.atan2(dy, dx),
        };
      }
    }

    return minDist < 20 ? closest : null;
  }

  const toolStyle = (name) => ({
    background: tool === name ? "#d1fae5" : "#fff",
    border: "1px solid #ccc",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  });

  return (
    <div style={{ padding: 20 }}>
      {/* TOOLBAR */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setTool("wall")} style={toolStyle("wall")}>🧱 Pared</button>
        <button onClick={() => setTool("toma")} style={toolStyle("toma")}>🔌 Toma</button>
        <button onClick={() => setTool("luz")} style={toolStyle("luz")}>💡 Luz</button>
        <button onClick={() => setTool("llave")} style={toolStyle("llave")}>🎛 Llave</button>
        <button onClick={() => setTool("tablero")} style={toolStyle("tablero")}>📦 Tablero</button>
        <button onClick={() => setTool("door")} style={toolStyle("door")}>🚪 Puerta</button>
        <button onClick={() => setTool("window")} style={toolStyle("window")}>🪟 Ventana</button>

        <button onClick={undo}>↩ Deshacer</button>
        <button onClick={clearAll}>🧹 Limpiar</button>

        <button
          onClick={() => {
            setTool("pipe");
            setSelectedSymbol(null);
          }}
          style={toolStyle("pipe")}
        >
          🔗 Canalizar
        </button>
      </div>

      {/* HINT */}
      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
        {getHint()}
      </div>

      <Stage
        width={1000}
        height={650}
        ref={stageRef}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        style={{
          border: "1px solid #ddd",
          background: "#fdfaf3",
          cursor:
            tool === "pipe"
              ? "pointer"
              : tool
              ? "crosshair"
              : "default",
        }}
      >
        <Layer>
          {/* GRID */}
          {Array.from({ length: 100 }).map((_, i) => (
            <Line
              key={"v" + i}
              points={[i * 20, 0, i * 20, 650]}
              stroke="#e8e2d6"
              strokeWidth={i % 5 === 0 ? 1 : 0.4}
            />
          ))}
          {Array.from({ length: 100 }).map((_, i) => (
            <Line
              key={"h" + i}
              points={[0, i * 20, 1000, i * 20]}
              stroke="#e8e2d6"
              strokeWidth={i % 5 === 0 ? 1 : 0.4}
            />
          ))}

          {/* ROOM */}
          {roomPoints.length > 0 && (
            <Line
              points={roomPoints.flatMap((p) => [p.x, p.y])}
              closed={!drawingRoom}
              stroke="#3f3f46"
              strokeWidth={5}
              fill={!drawingRoom ? "rgba(0,0,0,0.03)" : undefined}
            />
          )}

          {/* PREVIEW WALL */}
          {drawingRoom && mousePos && (
            <Line
              points={[
                roomPoints[roomPoints.length - 1].x,
                roomPoints[roomPoints.length - 1].y,
                mousePos.x,
                mousePos.y,
              ]}
              stroke="#a8a29e"
              strokeWidth={4}
              dash={[6, 4]}
            />
          )}

          {/* PREVIEW OPENINGS */}
          {mousePos && (tool === "door" || tool === "window") && roomPoints.length > 1 && (() => {
            const wall = getClosestWallSegment(mousePos, roomPoints);
            if (!wall) return null;

            return (
              <Group
                x={wall.x}
                y={wall.y}
                rotation={(wall.angle * 180) / Math.PI}
                opacity={0.4}
              >
                {tool === "door" ? (
                  <Line points={[0, 0, 60, 0]} stroke="#8b5a2b" strokeWidth={6} />
                ) : (
                  <Line points={[-40, 0, 40, 0]} stroke="#3b82f6" strokeWidth={6} />
                )}
              </Group>
            );
          })()}

          {/* OPENINGS */}
          {openings.map((o) => (
            <Group
              key={o.id}
              x={o.x}
              y={o.y}
              rotation={
                o.type === "door"
                  ? (o.angle * 180) / Math.PI - 90
                  : (o.angle * 180) / Math.PI
              }
              draggable
              onClick={(e) => {
                e.cancelBubble = true;

                if (o.type === "door") {
                  setOpenings((prev) =>
                    prev.map((op) =>
                      op.id === o.id
                        ? { ...op, flip: !op.flip }
                        : op
                    )
                  );
                }
              }}
              onWheel={(e) => {
                if (o.type !== "window") return;

                e.evt.preventDefault();
                e.cancelBubble = true;

                const delta = e.evt.deltaY > 0 ? -10 : 10;

                setOpenings((prev) =>
                  prev.map((op) =>
                    op.id === o.id
                      ? {
                          ...op,
                          width: Math.max(40, op.width + delta),
                        }
                      : op
                  )
                );
              }}
            >
              {o.type === "door" ? (
                <>
                  <Line points={[0, 0, 60, 0]} stroke="#8b5a2b" strokeWidth={6} />
                  <Shape
                    stroke="#8b5a2b"
                    strokeWidth={2}
                    sceneFunc={(ctx, shape) => {
                      ctx.beginPath();
                      ctx.arc(
                        0,
                        0,
                        60,
                        0,
                        o.flip ? -Math.PI / 2 : Math.PI / 2,
                        o.flip
                      );
                      ctx.strokeShape(shape);
                    }}
                  />
                </>
              ) : (
                <Line
                  points={[-o.width / 2, 0, o.width / 2, 0]}
                  stroke="#3b82f6"
                  strokeWidth={6}
                />
              )}
            </Group>
          ))}

          {/* PIPES */}
          {pipes.map((p) => {
            const from = getSymbol(p.from);
            const to = getSymbol(p.to);
            if (!from || !to) return null;

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            const offset = 40;

            let controlX = midX - (dy / length) * offset;
            let controlY = midY + (dx / length) * offset;

            function pointInPolygon(point, vs) {
              let x = point.x, y = point.y;
              let inside = false;
              for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                let xi = vs[i].x, yi = vs[i].y;
                let xj = vs[j].x, yj = vs[j].y;

                let intersect =
                  yi > y !== yj > y &&
                  x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
                if (intersect) inside = !inside;
              }
              return inside;
            }

            if (
              roomPoints.length > 2 &&
              !pointInPolygon({ x: controlX, y: controlY }, roomPoints)
            ) {
              controlX = midX + (dy / length) * offset;
              controlY = midY - (dx / length) * offset;
            }

            return (
              <Shape
                key={p.id}
                stroke="#ed093a"
                strokeWidth={4}
                lineCap="round"
                sceneFunc={(ctx, shape) => {
                  ctx.beginPath();
                  ctx.moveTo(from.x, from.y);
                  ctx.quadraticCurveTo(controlX, controlY, to.x, to.y);
                  ctx.fillStrokeShape(shape);
                }}
              />
            );
          })}

          {/* SYMBOLS */}
          {symbols.map((s) => (
            <Group
              key={s.id}
              x={s.x}
              y={s.y}
              draggable
              onMouseEnter={() => setHoveredSymbol(s.id)}
              onMouseLeave={() => setHoveredSymbol(null)}
              onClick={() => handleSymbolClick(s)}
              onDragEnd={(e) => {
                const newX = snap(e.target.x());
                const newY = snap(e.target.y());

                setSymbols((prev) =>
                  prev.map((sym) =>
                    sym.id === s.id
                      ? { ...sym, x: newX, y: newY }
                      : sym
                  )
                );
              }}
            >
              {(hoveredSymbol === s.id || selectedSymbol?.id === s.id) && (
                <Circle radius={20} stroke="#10b981" strokeWidth={2} />
              )}

              <Circle
                radius={14}
                fill={
                  s.type === "toma"
                    ? "#f3edf6"
                    : s.type === "luz"
                    ? "#facc15"
                    : s.type === "llave"
                    ? "#38bdf8"
                    : "#55f760"
                }
                shadowBlur={5}
              />
              <Text
                text={s.label}
                fontSize={11}
                offsetX={10}
                offsetY={6}
                fill="#111"
              />
            </Group>
          ))}
        </Layer>
      </Stage>

      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
        Agregá símbolos en modo continuo. Conectá tocando uno y luego otro.
      </div>
    </div>
  );
}