# 🔐 Configuración de Autenticación Firebase

## ⚠️ URGENTE: Sigue estos pasos para proteger tu aplicación

---

## Paso 1: Habilitar Firebase Authentication

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **procesos-7aeda**
3. En el menú lateral, haz clic en **"Authentication"** (Autenticación)
4. Haz clic en **"Get Started"** (Comenzar)
5. En la pestaña **"Sign-in method"** (Método de inicio de sesión):
   - Haz clic en **"Email/Password"**
   - **Activa** la opción "Email/Password"
   - Haz clic en **"Save"** (Guardar)

---

## Paso 2: Crear Usuario Inicial

1. En la consola de Firebase, ve a **Authentication** → **Users**
2. Haz clic en **"Add user"** (Agregar usuario)
3. Completa los datos:
   - **Email:** `hsesupergas@gmail.com`
   - **Password:** `ELrey@28`
4. Haz clic en **"Add user"** (Agregar usuario)

---

## Paso 3: Actualizar Reglas de Seguridad de Firestore

1. En la consola de Firebase, ve a **Firestore Database**
2. Haz clic en la pestaña **"Rules"** (Reglas)
3. **Reemplaza todo el contenido** con estas reglas:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer y escribir
    match /areas/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Colección de usuarios autorizados (solo lectura para autenticados)
    match /authorized_users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Haz clic en **"Publish"** (Publicar)

---

## Paso 4: Probar el Login

1. Abre tu aplicación en el navegador
2. Deberías ver la pantalla de login
3. Ingresa:
   - **Email:** `hsesupergas@gmail.com`
   - **Password:** `ELrey@28`
4. Haz clic en **"Iniciar Sesión"**

✅ Si todo está correcto, deberías ver la aplicación con tus datos.

---

## Paso 5: Verificar que los datos estén protegidos

1. Abre una ventana de incognito
2. Intenta acceder a la aplicación
3. Deberías ser redirigido a la pantalla de login
4. Sin credenciales válidas, NO se puede acceder a los datos

✅ Esto confirma que tu aplicación está protegida.

---

## 🔒 Seguridad Implementada

Con estos cambios:

- ✅ Solo usuarios autenticados pueden acceder a la aplicación
- ✅ Solo usuarios autenticados pueden leer/escribir datos en Firestore
- ✅ Nadie puede acceder sin credenciales válidas
- ✅ Los datos están protegidos

---

## 📝 Próximos Pasos (Opcional)

### Agregar más usuarios autorizados:

1. Ve a Firebase Console → Authentication → Users
2. Haz clic en "Add user"
3. Ingresa el email y contraseña del nuevo usuario
4. El nuevo usuario podrá iniciar sesión inmediatamente

---

## ⚠️ IMPORTANTE

**Completa estos pasos AHORA** para proteger tu aplicación. Sin estos cambios, la aplicación no permitirá el acceso.

Una vez completados, avísame para desplegar la versión segura a producción.
