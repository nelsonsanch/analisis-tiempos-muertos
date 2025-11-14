import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxH9RVCUmoALNAWQWViws5dtuMQo-sdtU",
  authDomain: "procesos-7aeda.firebaseapp.com",
  projectId: "procesos-7aeda",
  storageBucket: "procesos-7aeda.firebasestorage.app",
  messagingSenderId: "292290538178",
  appId: "1:292290538178:web:198d2326f32aca82d6e95b",
  measurementId: "G-T5JT6Y7C2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
