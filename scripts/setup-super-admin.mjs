#!/usr/bin/env node

/**
 * Script para configurar un usuario como super_admin
 * Uso: node scripts/setup-super-admin.mjs <email>
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Configuración de Firebase (debe coincidir con client/src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "tiemposapp-9omoqzpg.firebaseapp.com",
  projectId: "tiemposapp-9omoqzpg",
  storageBucket: "tiemposapp-9omoqzpg.firebasestorage.app",
  messagingSenderId: "1095991746730",
  appId: "1:1095991746730:web:a7e0c8f4f3e4f3e4f3e4f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupSuperAdmin(email) {
  try {
    console.log(`\n🔍 Buscando usuario con email: ${email}...`);

    // En Firebase Auth, necesitamos el UID del usuario
    // Como no tenemos acceso al Admin SDK aquí, vamos a usar el UID conocido
    const uid = 'aDkPLq0KdQOy0JhfGkPVSKYVmPF2'; // UID de nelson@sanchezcya.com

    console.log(`📝 Configurando usuario ${uid} como super_admin...`);

    const userRef = doc(db, 'users', uid);

    // Verificar si ya existe
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: uid,
      email: email,
      role: 'super_admin',
      name: 'Nelson Sanchez',
      createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // No incluir companyId para super_admin
    await setDoc(userRef, userData, { merge: true });

    console.log(`✅ Usuario configurado exitosamente como super_admin`);
    console.log(`\n📋 Datos del usuario:`);
    console.log(JSON.stringify(userData, null, 2));
    console.log(`\n🎉 ¡Listo! Ahora puedes iniciar sesión y acceder a /super-admin`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Debes proporcionar un email');
  console.log('Uso: node scripts/setup-super-admin.mjs <email>');
  process.exit(1);
}

setupSuperAdmin(email);
