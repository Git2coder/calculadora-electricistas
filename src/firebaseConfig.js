// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBknZUTAUhuW3yEhuqc9O4y0mTm-nEgpLo",
    authDomain: "calculadora-electricistas.firebaseapp.com",
    projectId: "calculadora-electricistas",
    storageBucket: "calculadora-electricistas.firebasestorage.app",
    messagingSenderId: "1075246254208",
    appId: "1:1075246254208:web:2fd6982699db758c0cfe65"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
