// api/firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta relativa a la raíz del proyecto
const serviceAccountPath = path.join(__dirname, "../secrets/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Inicializar solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
