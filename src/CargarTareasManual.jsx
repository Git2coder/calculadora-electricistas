import React, { useEffect } from "react";
import subirTareasAFirebase from "./utils/subirTareas";

export default function CargarTareasManual() {
  useEffect(() => {
    subirTareasAFirebase();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-green-600">
        Subiendo tareas a Firestore...
      </h1>
    </div>
  );
}
