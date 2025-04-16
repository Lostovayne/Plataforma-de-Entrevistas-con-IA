import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string, // Replace with your Firebase API key,
  authDomain: 'prepwise-2d1a9.firebaseapp.com',
  projectId: 'prepwise-2d1a9',
  storageBucket: 'prepwise-2d1a9.firebasestorage.app',
  messagingSenderId: '283283632899',
  appId: '1:283283632899:web:6906a043bb0a45228aaf36',
  measurementId: 'G-1B5PFHN3JG',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
