import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Reaproveita a mesma instância do app Firebase usada em toda a aplicação
// (evita inicializar duas vezes caso outro módulo, como googleDriveAuth.ts,
// já tenha chamado initializeApp).
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
