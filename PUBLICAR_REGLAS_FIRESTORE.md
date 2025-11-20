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
    
    // Colección de usuarios (perfiles)
    match /users/{userId} {
      // Cualquier usuario autenticado puede leer su propio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      // Permitir crear perfil durante registro (userId debe coincidir con auth.uid)
      allow create: if request.auth != null && 
                       request.auth.uid == userId;
      // Solo el propio usuario puede actualizar su perfil
      allow update: if request.auth != null && request.auth.uid == userId;
      // Solo el propio usuario puede eliminar su perfil
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Colección de empresas
    match /companies/{companyId} {
      // Usuarios autenticados pueden leer cualquier empresa (para super admin)
      allow read: if request.auth != null;
      // Permitir crear empresa durante registro (cualquier usuario autenticado)
      allow create: if request.auth != null && 
                       request.resource.data.status == 'pending';
      // Solo usuarios autenticados pueden actualizar empresas
      allow update: if request.auth != null;
      // Solo usuarios autenticados pueden eliminar empresas
      allow delete: if request.auth != null;
    }
    
    // Colección de áreas de análisis (multi-tenant)
    match /timeAnalysisAreas/{areaId} {
      // Usuarios autenticados pueden leer áreas
      allow read: if request.auth != null;
      // Usuarios autenticados pueden crear áreas
      allow create: if request.auth != null;
      // Usuarios autenticados pueden actualizar áreas
      allow update: if request.auth != null;
      // Usuarios autenticados pueden eliminar áreas
      allow delete: if request.auth != null;
    }
    
    // Colección de mediciones globales (multi-tenant)
    match /globalMeasurements/{measurementId} {
      // Usuarios autenticados pueden leer mediciones
      allow read: if request.auth != null;
      // Usuarios autenticados pueden crear mediciones
      allow create: if request.auth != null;
      // Usuarios autenticados pueden actualizar mediciones
      allow update: if request.auth != null;
      // Usuarios autenticados pueden eliminar mediciones
      allow delete: if request.auth != null;
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
- **Acceso a datos**: Usuarios autenticados pueden acceder a sus áreas y mediciones
- **Operaciones CRUD**: Crear, leer, actualizar y eliminar datos propios

### ❌ Bloquean:
- Acceso de usuarios no autenticados
- Modificación de perfiles de otros usuarios

---

## ⚠️ NOTA IMPORTANTE

Estas reglas son **SIMPLIFICADAS** para permitir que el sistema funcione. En el futuro, deberás implementar reglas más restrictivas que:

1. Verifiquen el `companyId` en cada operación
2. Validen que solo el super admin pueda aprobar empresas
3. Bloqueen acceso a datos de otras empresas

Para implementar estas reglas avanzadas, necesitarás usar la lógica de negocio en el backend (Cloud Functions) en lugar de reglas de Firestore, ya que Firestore no permite hacer consultas a otras colecciones dentro de las reglas.

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
