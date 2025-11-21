# Script para Agregar companyId a Todas las Áreas

## ⚠️ PROBLEMA
Solo las áreas con `companyId: "ZYLNLUFJbj3yTpPEIxbO"` se muestran en la aplicación. Las áreas sin este campo están siendo bloqueadas por las reglas de Firestore.

## ✅ SOLUCIÓN
Ejecutar este script en Firebase Console para agregar `companyId` a todas las áreas.

---

## 📝 INSTRUCCIONES

### Paso 1: Abrir Firebase Console
1. Ve a https://console.firebase.google.com
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Haz clic en la pestaña **"Reglas"** (Rules)
5. Haz clic en **"Compilador de consultas"** (Query Compiler) en la parte superior derecha

### Paso 2: Ejecutar el Script

Copia y pega este código JavaScript en la consola del navegador (F12 → Console):

```javascript
// Script para agregar companyId a todas las áreas sin este campo
(async function() {
  const companyId = "ZYLNLUFJbj3yTpPEIxbO";
  
  console.log("🔍 Buscando áreas sin companyId...");
  
  // Importar Firebase Firestore
  const { getFirestore, collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
  
  const db = getFirestore();
  const areasRef = collection(db, 'timeAnalysisAreas');
  
  try {
    const snapshot = await getDocs(areasRef);
    let updated = 0;
    let skipped = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      if (!data.companyId) {
        console.log(`📝 Actualizando área: ${data.areaName || docSnapshot.id}`);
        await updateDoc(doc(db, 'timeAnalysisAreas', docSnapshot.id), {
          companyId: companyId
        });
        updated++;
      } else {
        console.log(`✅ Área ya tiene companyId: ${data.areaName || docSnapshot.id}`);
        skipped++;
      }
    }
    
    console.log(`\n✅ COMPLETADO:`);
    console.log(`   - ${updated} áreas actualizadas`);
    console.log(`   - ${skipped} áreas ya tenían companyId`);
    console.log(`\n🔄 Recarga la aplicación para ver todos los datos.`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("Detalles:", error.message);
  }
})();
```

### Paso 3: Verificar

Después de ejecutar el script, verifica en Firestore Database que todas las áreas ahora tienen el campo `companyId: "ZYLNLUFJbj3yTpPEIxbO"`.

### Paso 4: Recargar la Aplicación

1. Ve a la aplicación: https://3000-iu2xljnyyck5x0szh4cdw-e21ab572.manusvm.computer/
2. Inicia sesión con hsesupergas@gmail.com
3. Ahora deberías ver TODAS las áreas

---

## 🎯 RESULTADO ESPERADO

Después de ejecutar este script, TODAS las áreas en Firebase tendrán el campo `companyId` y se mostrarán en la aplicación cuando hsesupergas@gmail.com inicie sesión.

---

## ⚠️ NOTA IMPORTANTE

Este script es seguro porque:
- Solo AGREGA el campo `companyId` a las áreas que no lo tienen
- NO modifica áreas que ya tienen `companyId`
- NO elimina ni sobrescribe datos existentes
