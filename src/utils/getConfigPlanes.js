// src/utils/getConfigPlanes.js
import { getFirestore, doc, getDoc } from "firebase/firestore";

export async function getConfigPlanes() {
  const db = getFirestore();
  const ref = doc(db, "config", "planes");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
