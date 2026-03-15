import React from "react";

export default function ElevationPanel({ wall, symbols, openings }) {
  const WALL_HEIGHT = 260;

  function project(point) {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const lenSq = dx * dx + dy * dy;

    let t =
      ((point.x - wall.x1) * dx +
        (point.y - wall.y1) * dy) /
      lenSq;

    t = Math.max(0, Math.min(1, t));

    const projX = wall.x1 + t * dx;
    const projY = wall.y1 + t * dy;
    const dist = Math.hypot(point.x - projX, point.y - projY);

    return { t, dist };
  }

  const projectedSymbols = symbols
    .map(s => {
      const p = project(s);
      return p.dist < 15 ? { ...s, t: p.t } : null;
    })
    .filter(Boolean);

  const projectedOpenings = openings
    .map(o => {
      const p = project(o);
      return p.dist < 15 ? { ...o, t: p.t } : null;
    })
    .filter(Boolean);

  return (
    <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10 }}>
      <h3>Elevación</h3>
      <div style={{ position: "relative", height: WALL_HEIGHT, background: "#fafafa" }}>
        {projectedOpenings.map(o => (
          <div
            key={o.id}
            style={{
              position: "absolute",
              left: `${o.t * 100}%`,
              bottom: 0,
              width: 60,
              height: o.type === "door" ? 200 : 120,
              background: o.type === "door" ? "#8b5a2b" : "#3b82f6"
            }}
          />
        ))}

        {projectedSymbols.map(s => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: `${s.t * 100}%`,
              bottom: 120,
              width: 20,
              height: 20,
              background: "#22c55e"
            }}
          />
        ))}
      </div>
    </div>
  );
}