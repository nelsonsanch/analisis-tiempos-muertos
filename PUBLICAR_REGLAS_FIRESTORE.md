# 🔥 INSTRUCCIONES PARA PUBLICAR REGLAS DE FIRESTORE

## ⚠️ IMPORTANTE: PASO OBLIGATORIO

El sistema **NO FUNCIONARÁ** hasta que publiques estas reglas en Firebase Console.

---

## 📋 Pasos para Publicar las Reglas

### 1️⃣ Abrir Firebase Console

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral izquierdo, haz clic en **"Firestore Database"**
4. Haz clic en la pestaña **"Reglas"** (Rules)

### 2️⃣ Copiar las Reglas

Copia **TODO** el siguiente código:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para obtener el perfil del usuario
    function getUserProfile() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper function para verificar si es super admin
    function isSuperAdmin() {
      return request.auth != null && getUserProfile().role == 'super_admin';
    }
    
    // Helper function para verificar si el usuario pertenece a la empresa
    function belongsToCompany(companyId) {
      return request.auth != null && getUserProfile().companyId == companyId;
    }
    
    // Helper function para verificar si la empresa del usuario está activa
    function isCompanyActive() {
      let profile = getUserProfile();
      if (!exists(/databases/$(database)/documents/companies/$(profile.companyId))) {
        return false;
      }
      let company = get(/databases/$(database)/documents/companies/$(profile.companyId)).data;
      return company.status == 'active';
    }
    
    // Colección de usuarios (perfiles)
    match /users/{userId} {
      // Cualquier usuario autenticado puede leer su propio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      // Permitir crear perfil durante registro (userId debe coincidir con auth.uid)
      allow create: if request.auth != null && request.auth.uid == userId;
      // Solo el propio usuario o super admin pueden actualizar/eliminar
      allow update, delete: if request.auth != null && (request.auth.uid == userId || isSuperAdmin());
    }
    
    // Colección de empresas
    match /companies/{companyId} {
      // Super admin puede leer y escribir todas las empresas
      allow read, write: if isSuperAdmin();
      // Usuarios de la empresa pueden leer su propia empresa
      allow read: if belongsToCompany(companyId);
      // Permitir crear empresa durante registro (cualquier usuario autenticado)
      allow create: if request.auth != null && request.resource.data.status == 'pending';
    }
    
    // Colección de áreas de análisis (multi-tenant)
    match /timeAnalysisAreas/{areaId} {
      // Super admin NO puede acceder a datos de empresas
      // Usuarios solo pueden acceder a áreas de su empresa Y su empresa debe estar activa
      allow read: if request.auth != null && 
                     !isSuperAdmin() && 
                     belongsToCompany(resource.data.companyId) &&
                     isCompanyActive();
      
      allow create: if request.auth != null && 
                       !isSuperAdmin() && 
                       belongsToCompany(request.resource.data.companyId) &&
                       isCompanyActive();
      
      allow update, delete: if request.auth != null && 
                               !isSuperAdmin() && 
                               belongsToCompany(resource.data.companyId) &&
                               isCompanyActive();
    }
    
    // Colección de mediciones globales (multi-tenant)
    match /globalMeasurements/{measurementId} {
      // Super admin NO puede acceder a mediciones de empresas
      // Usuarios solo pueden acceder a mediciones de su empresa Y su empresa debe estar activa
      allow read: if request.auth != null && 
                     !isSuperAdmin() && 
                     belongsToCompany(resource.data.companyId) &&
                     isCompanyActive();
      
      allow create: if request.auth != null && 
                       !isSuperAdmin() && 
                       belongsToCompany(request.resource.data.companyId) &&
                       isCompanyActive();
      
      allow update, delete: if request.auth != null && 
                               !isSuperAdmin() && 
                               belongsToCompany(resource.data.companyId) &&
                               isCompanyActive();
    }
    
    // Colección de items globales de Tortuga (compartidos entre empresas)
    match /globalTurtleItems/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Colección de usuarios autorizados (legacy - mantener por compatibilidad)
    match /authorized_users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3️⃣ Pegar y Publicar

1. **Borra todo** el contenido actual en el editor de reglas
2. **Pega** el código de arriba
3. Haz clic en el botón **"Publicar"** (Publish)
4. Confirma la publicación

### 4️⃣ Verificar

Después de publicar:
1. Intenta registrar una nueva empresa desde `/register`
2. El registro debería funcionar sin errores de permisos

---

## 🔍 ¿Qué Hacen Estas Reglas?

### ✅ Permiten:
- **Registro de nuevas empresas**: Cualquier usuario autenticado puede crear su empresa (con estado "pendiente")
- **Crear perfil de usuario**: Durante el registro, el usuario puede crear su propio perfil
- **Aislamiento multi-tenant**: Cada empresa solo ve sus propios datos
- **Control de acceso por estado**: Solo empresas activas pueden usar el sistema

### ❌ Bloquean:
- Acceso a datos de otras empresas
- Modificación de empresas sin autorización
- Acceso de empresas pendientes o inactivas a áreas y mediciones
- Super admin no puede ver datos de empresas (solo gestionarlas)

---

## 🆘 Solución de Problemas

### Error: "Missing or insufficient permissions"
- **Causa**: Las reglas no están publicadas o están mal configuradas
- **Solución**: Verifica que hayas publicado las reglas exactamente como se muestran arriba

### Error: "auth/email-already-in-use"
- **Causa**: El correo ya está registrado
- **Solución**: Usa otro correo o elimina el usuario existente desde Firebase Console

### Las empresas no aparecen en el panel de super admin
- **Causa**: El super admin no tiene permisos de lectura
- **Solución**: Verifica que el usuario tenga `role: 'super_admin'` en la colección `users`

---

## 📞 Soporte

Si después de publicar las reglas sigues teniendo problemas, verifica:
1. Que el proyecto de Firebase sea el correcto
2. Que las reglas se hayan publicado correctamente (sin errores de sintaxis)
3. Que el usuario esté autenticado en Firebase Authentication
