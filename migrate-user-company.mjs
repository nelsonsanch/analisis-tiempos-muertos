/**
 * Script de migración: Asignar empresa automáticamente a usuarios sin companyId
 * 
 * Este script busca usuarios que no tienen companyId asignado y les crea
 * una empresa automáticamente.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

// Configuración de Firebase (debe coincidir con client/src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "procesos-7aeda.firebaseapp.com",
  projectId: "procesos-7aeda",
  storageBucket: "procesos-7aeda.firebasestorage.app",
  messagingSenderId: "1062088758099",
  appId: "1:1062088758099:web:4c8e7e1f9a9c2b5e8f9c3d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsersWithoutCompany() {
  console.log('🔍 Buscando usuarios sin companyId...\n');

  try {
    // 1. Obtener todos los usuarios
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;

      // 2. Verificar si el usuario ya tiene companyId
      if (userData.companyId) {
        console.log(`⏭️  Usuario ${userData.email} ya tiene companyId: ${userData.companyId}`);
        skippedCount++;
        continue;
      }

      console.log(`\n📝 Procesando usuario: ${userData.email}`);

      // 3. Crear empresa para el usuario
      const companyName = userData.name
        ? `Empresa de ${userData.name}`
        : `Empresa de ${userData.email?.split('@')[0] || 'Usuario'}`;

      const companyRef = doc(collection(db, 'companies'));
      const companyId = companyRef.id;

      const company = {
        name: companyName,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: uid,
        adminEmail: userData.email,
        adminName: userData.name || undefined,
        nit: 'Por definir',
        phone: 'Por definir',
        economicActivity: 'Por definir',
        address: 'Por definir',
      };

      await setDoc(companyRef, company);
      console.log(`   ✅ Empresa creada: "${companyName}" (ID: ${companyId})`);

      // 4. Actualizar usuario con companyId
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userData,
        companyId,
        updatedAt: new Date().toISOString(),
      });

      console.log(`   ✅ Usuario actualizado con companyId: ${companyId}`);
      migratedCount++;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ Migración completada:`);
    console.log(`   - Usuarios migrados: ${migratedCount}`);
    console.log(`   - Usuarios omitidos (ya tenían empresa): ${skippedCount}`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateUsersWithoutCompany()
  .then(() => {
    console.log('✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
