# 🔥 Configuración de Firebase Firestore

## ⚠️ Problema Actual

La aplicación muestra errores de permisos porque las reglas de seguridad de Firestore no coinciden con los nombres de las colecciones en el código.

**Error en consola:** `Missing or insufficient permissions`

---

## 📋 Solución: Actualizar Reglas de Firestore

### **Paso 1: Ir a la Consola de Firebase**

1. Abre [https://console.firebase.google.com](https://console.firebase.google.com)
2. Inicia sesión con: `nelson@sanchezcya.com`
3. Selecciona tu proyecto: **"procesos-7aeda"**

---

### **Paso 2: Configurar Firestore Database**

1. En el menú lateral izquierdo, haz clic en **"Firestore Database"**
2. Si no existe la base de datos:
   - Haz clic en **"Crear base de datos"**
   - Selecciona **"Modo de producción"** (más seguro)
   - Elige la ubicación: **"us-east1"** (más cercana a Colombia)
   - Haz clic en **"Habilitar"**

---

### **Paso 3: Actualizar Reglas de Seguridad (CORREGIDAS)**

1. En Firestore Database, haz clic en la pestaña **"Reglas"** (Rules)
2. **Reemplaza** todo el contenido con estas reglas corregidas:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura en la colección 'timeAnalysisAreas'
    match /timeAnalysisAreas/{areaId} {
      allow read, write: if true;
    }
    
    // Permitir lectura y escritura en la colección 'globalMeasurements'
    match /globalMeasurements/{measurementId} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en **"Publicar"** (Publish)

---

## ✅ ¿Por qué fallaban las reglas anteriores?

El código de la aplicación usa:
- `timeAnalysisAreas` para guardar las áreas
- `globalMeasurements` para guardar las mediciones globales

Pero las reglas anteriores solo permitían acceso a `areas` (sin el prefijo `timeAnalysis`), por eso Firebase bloqueaba las operaciones.

---

## ⚠️ **Importante sobre Seguridad**

Las reglas actuales (`allow read, write: if true`) permiten acceso **público** a todos los datos.

Esto está bien para **desarrollo y pruebas**, pero para **producción** deberías:

### **Opción 1: Autenticación de Firebase (Recomendado)**

Si quieres que cada usuario solo vea sus propios datos:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /timeAnalysisAreas/{areaId} {
      // Solo el dueño puede leer/escribir
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      // Permitir crear si está autenticado
      allow create: if request.auth != null;
    }
    
    match /globalMeasurements/{measurementId} {
      // Solo el dueño puede leer/escribir
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      // Permitir crear si está autenticado
      allow create: if request.auth != null;
    }
  }
}
```

(Requiere implementar Firebase Authentication en la app)

### **Opción 2: Acceso Privado por Contraseña**

Si quieres que solo tú accedas:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /timeAnalysisAreas/{areaId} {
      // Solo permitir si el usuario está autenticado
      allow read, write: if request.auth != null;
    }
    
    match /globalMeasurements/{measurementId} {
      // Solo permitir si el usuario está autenticado
      allow read, write: if request.auth != null;
    }
  }
}
```

(Requiere implementar Firebase Authentication)

### **Opción 3: Mantener Público (Solo para Demo)**

Si quieres que cualquiera pueda ver y editar (útil para demos):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /timeAnalysisAreas/{areaId} {
      allow read, write: if true;
    }
    
    match /globalMeasurements/{measurementId} {
      allow read, write: if true;
    }
  }
}
```

---

## ✅ Verificación

Después de configurar las reglas:

1. **Recarga** la aplicación en el navegador (F5)
2. El badge de "Error de conexión" debería cambiar a **"☁️ Sincronizado"**
3. Intenta crear una nueva medición global haciendo clic en **"📸 Crear Medición Global"**
4. Verifica que se guarde correctamente y aparezca en el Dashboard de Mediciones

---

## 🔐 Recomendación Final

Para tu caso (consultor que usa la app en diferentes dispositivos):

**Mejor opción:** Implementar Firebase Authentication con Google Sign-In

Esto te permitirá:
- ✅ Cada usuario ve solo sus propios datos
- ✅ Iniciar sesión fácilmente con tu cuenta de Google
- ✅ Seguridad robusta sin contraseñas adicionales

Si quieres que implemente esto, solo dímelo y lo agrego a la aplicación.

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas configurando Firebase, avísame y te guío paso a paso con capturas de pantalla.
