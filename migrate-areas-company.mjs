import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// Configuración de Firebase (misma que en firebaseConfig.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBSNP-c2KKVOjODwpVxvwDwjWDPcJZnPjw",
  authDomain: "procesos-7aeda.firebaseapp.com",
  projectId: "procesos-7aeda",
  storageBucket: "procesos-7aeda.firebasestorage.app",
  messagingSenderId: "1073267815669",
  appId: "1:1073267815669:web:c0da8a8e7e0f7f7e7f7f7f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateAreasCompanyId() {
  console.log('🔍 Buscando áreas sin companyId...');
  
  try {
    // Obtener todas las áreas
    const areasRef = collection(db, 'timeAnalysisAreas');
    const snapshot = await getDocs(areasRef);
    
    let totalAreas = 0;
    let areasWithoutCompany = 0;
    let areasUpdated = 0;
    
    console.log(`📊 Total de áreas encontradas: ${snapshot.size}`);
    
    for (const areaDoc of snapshot.docs) {
      totalAreas++;
      const area = areaDoc.data();
      
      // Si el área no tiene companyId o es null
      if (!area.companyId) {
        areasWithoutCompany++;
        console.log(`\n⚠️  Área sin companyId: ${area.areaName} (ID: ${areaDoc.id})`);
        console.log(`   Manager: ${area.managerName}`);
        console.log(`   Fecha: ${area.date}`);
        
        // OPCIÓN 1: Asignar a una empresa específica
        // Por ahora, vamos a marcarlas para revisión manual
        console.log(`   ⏭️  Saltando (requiere asignación manual)`);
        
        // OPCIÓN 2: Si quieres asignarlas automáticamente a una empresa:
        // const defaultCompanyId = 'PU6CjbTgUOi6Ig3RVfv6'; // ID de una empresa
        // await updateDoc(doc(db, 'timeAnalysisAreas', areaDoc.id), {
        //   companyId: defaultCompanyId
        // });
        // areasUpdated++;
        // console.log(`   ✅ Asignada a empresa: ${defaultCompanyId}`);
      }
    }
    
    console.log('\n📈 Resumen de migración:');
    console.log(`   Total de áreas: ${totalAreas}`);
    console.log(`   Áreas sin companyId: ${areasWithoutCompany}`);
    console.log(`   Áreas actualizadas: ${areasUpdated}`);
    
    if (areasWithoutCompany > 0) {
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('   Hay áreas sin companyId que requieren asignación manual.');
      console.log('   Opciones:');
      console.log('   1. Eliminarlas si son de prueba');
      console.log('   2. Asignarlas a una empresa específica');
      console.log('   3. Descomentar la OPCIÓN 2 en el script y ejecutar nuevamente');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración
migrateAreasCompanyId()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
