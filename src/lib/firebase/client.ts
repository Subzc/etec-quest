import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Storage NÃO é inicializado aqui de propósito: o plano gratuito (Spark) do
// Firebase não habilita o Cloud Storage. Tudo neste projeto funciona sem
// ele (avatares usam a foto do Google; ícones de matérias são nomes de
// ícone, não arquivos). Se um dia precisar subir arquivos de verdade, ative
// o Storage no Console (isso exige upgrade para o plano Blaze, que tem uma
// faixa gratuita generosa) e importe getStorage("firebase/storage") aqui.

export const googleProvider = new GoogleAuthProvider();
