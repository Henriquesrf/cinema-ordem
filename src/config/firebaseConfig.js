// Configuração Web do projeto de filmes, conforme o Firebase Console.
// Os identificadores do app são públicos. Não inclua chaves administrativas.
import { getApp, getApps, initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyCyB8zpVT_uyBycSofeJP1Qr_rZMw3lKQs",
  authDomain: "cinema-5621e.firebaseapp.com",
  projectId: "cinema-5621e",
  storageBucket: "cinema-5621e.firebasestorage.app",
  messagingSenderId: "460378775245",
  appId: "1:460378775245:web:8f3e85a09a83b27da9d384",
  databaseURL: "https://cinema-5621e-default-rtdb.firebaseio.com/",
};

export const firebaseConfigurado = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Reutiliza a instância ao recarregar o aplicativo durante o desenvolvimento.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export default app;
