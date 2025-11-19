import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxH9RVCUmoALNAWQWViws5dtuMQo-sdtU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "procesos-7aeda.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "procesos-7aeda",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "procesos-7aeda.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "292290538178",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:292290538178:web:198d2326f32aca82d6e95b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T5JT6Y7C2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
