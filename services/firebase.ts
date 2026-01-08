import * as firebaseApp from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnsJugIx7oLY55LYF235B9ietajE17DHA",
  authDomain: "casalfinancas-bc8c7.firebaseapp.com",
  projectId: "casalfinancas-bc8c7",
  storageBucket: "casalfinancas-bc8c7.firebasestorage.app",
  messagingSenderId: "435875107138",
  appId: "1:435875107138:web:23f842992c228a323ff8db"
};

// Inicializa o Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Exporta os serviços para uso no app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
