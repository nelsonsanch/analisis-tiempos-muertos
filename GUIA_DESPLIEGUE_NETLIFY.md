# 🚀 Guía Paso a Paso: Despliegue en Netlify

Esta guía te llevará de la mano para configurar correctamente tu aplicación en Netlify. **No te preocupes por cometer errores**, cada paso está explicado claramente.

---

## 📋 Antes de Empezar

Necesitarás tener a mano:
- ✅ Acceso a tu cuenta de Netlify
- ✅ Acceso a Firebase Console (https://console.firebase.google.com/)
- ✅ 15-20 minutos de tiempo

---

## Parte 1: Configurar Variables de Entorno en Netlify

### 🎯 Paso 1: Acceder a Netlify

1. Abre tu navegador
2. Ve a: **https://app.netlify.com/**
3. Inicia sesión con tu cuenta
4. En el dashboard principal, busca tu sitio **analisis-tiempos-muertos**
5. Haz clic en el nombre del sitio para entrar

### 🎯 Paso 2: Ir a Environment Variables

1. Una vez dentro del sitio, en el menú superior verás varias pestañas
2. Haz clic en **Site settings**
3. En el menú lateral izquierdo, busca **Environment variables** (está en la sección "Build & deploy")
4. Haz clic en **Environment variables**

### 🎯 Paso 3: Agregar las Variables (IMPORTANTE)

Ahora vas a agregar 9 variables. **Copia y pega exactamente** como se muestra:

#### Variable 1: API Key de Firebase
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_API_KEY`
- **Value**: `AIzaSyBxH9RVCUmoALNAWQWViws5dtuMQo-sdtU`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 2: Auth Domain
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: `procesos-7aeda.firebaseapp.com`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 3: Project ID
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: `procesos-7aeda`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 4: Storage Bucket
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: `procesos-7aeda.firebasestorage.app`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 5: Messaging Sender ID
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `292290538178`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 6: App ID
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_APP_ID`
- **Value**: `1:292290538178:web:198d2326f32aca82d6e95b`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 7: Measurement ID
- Haz clic en **Add a variable**
- **Key**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Value**: `G-T5JT6Y7C2G`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 8: Título de la App
- Haz clic en **Add a variable**
- **Key**: `VITE_APP_TITLE`
- **Value**: `Análisis de Tiempos Muertos`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

#### Variable 9: Logo de la App
- Haz clic en **Add a variable**
- **Key**: `VITE_APP_LOGO`
- **Value**: `https://placehold.co/128x128/E1E7EF/1F2937?text=App`
- **Scopes**: Marca "All scopes"
- Haz clic en **Create variable**

### ✅ Paso 4: Verificar que agregaste todas las variables

Deberías ver una lista con estas 9 variables:
- ✓ VITE_FIREBASE_API_KEY
- ✓ VITE_FIREBASE_AUTH_DOMAIN
- ✓ VITE_FIREBASE_PROJECT_ID
- ✓ VITE_FIREBASE_STORAGE_BUCKET
- ✓ VITE_FIREBASE_MESSAGING_SENDER_ID
- ✓ VITE_FIREBASE_APP_ID
- ✓ VITE_FIREBASE_MEASUREMENT_ID
- ✓ VITE_APP_TITLE
- ✓ VITE_APP_LOGO

### 🎯 Paso 5: Redesplegar el sitio

1. En el menú superior, haz clic en **Deploys**
2. En la esquina superior derecha, haz clic en **Trigger deploy**
3. Selecciona **Deploy site**
4. Verás que comienza un nuevo despliegue
5. Espera 2-5 minutos hasta que aparezca un ✓ verde que dice "Published"

---

## Parte 2: Configurar Firebase Console

### 🎯 Paso 6: Autorizar el dominio de Netlify en Firebase

1. Abre una nueva pestaña y ve a: **https://console.firebase.google.com/**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el proyecto **procesos-7aeda**
4. En el menú lateral izquierdo, busca **Authentication** (ícono de persona)
5. Haz clic en **Authentication**
6. En la parte superior, haz clic en la pestaña **Settings**
7. Baja hasta encontrar la sección **Authorized domains**
8. Haz clic en **Add domain**
9. Copia y pega tu dominio de Netlify (ejemplo: `691d1ce71a677a510d0ab563--analisis-tiempos-muertos.netlify.app`)
   - **¿Dónde encuentro mi dominio?** En Netlify, en la página principal de tu sitio, aparece arriba en grande
10. Haz clic en **Add**

### 🎯 Paso 7: Actualizar las reglas de Firestore

1. En Firebase Console, en el menú lateral izquierdo, busca **Firestore Database**
2. Haz clic en **Firestore Database**
3. En la parte superior, haz clic en la pestaña **Rules**
4. Verás un editor de código
5. **Borra todo** el contenido actual
6. **Copia y pega** exactamente este código:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Colección principal de áreas (InterviewData)
    match /areas/{areaId} {
      allow read, write: if isAuthenticated();
    }
    
    // Colección de mediciones globales
    match /globalMeasurements/{measurementId} {
      allow read, write: if isAuthenticated();
    }
    
    // Colección de items globales de Tortuga
    match /globalTurtleItems/{itemId} {
      allow read, write: if isAuthenticated();
    }
    
    // Colección legacy de análisis de tiempos
    match /timeAnalysisAreas/{areaId} {
      allow read, write: if isAuthenticated();
    }
    
    // Colección de usuarios autorizados
    match /authorized_users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Denegar acceso a cualquier otra colección
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

7. Haz clic en **Publish** (botón azul arriba a la derecha)
8. Confirma haciendo clic en **Publish** nuevamente

---

## Parte 3: Verificar que Todo Funciona

### 🎯 Paso 8: Probar la aplicación

1. Ve a Netlify y copia la URL de tu sitio
2. Abre la URL en una nueva pestaña
3. La aplicación debería cargar sin errores
4. Intenta crear una nueva área de prueba
5. Si todo funciona correctamente, ¡felicidades! 🎉

---

## ❓ ¿Qué hago si algo sale mal?

### Error: "Domain not authorized"
- Verifica que agregaste correctamente el dominio en Firebase Console → Authentication → Authorized domains
- Asegúrate de que el dominio coincida exactamente (sin https:// al inicio)

### Error: "Invalid API key"
- Revisa que copiaste correctamente todas las variables en Netlify
- Verifica que no haya espacios al inicio o final de los valores
- Asegúrate de que hiciste un nuevo deploy después de agregar las variables

### La aplicación sigue sin funcionar
- Abre las herramientas de desarrollador del navegador (F12)
- Ve a la pestaña "Console"
- Toma una captura de pantalla de los errores que aparecen
- Comparte esa captura para obtener ayuda específica

---

## 🎯 Resumen de lo que hiciste

1. ✅ Configuraste 9 variables de entorno en Netlify
2. ✅ Redesplegaste el sitio en Netlify
3. ✅ Autorizaste el dominio de Netlify en Firebase
4. ✅ Actualizaste las reglas de seguridad de Firestore
5. ✅ Verificaste que todo funciona correctamente

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas o dudas:
- Abre un issue en el repositorio de GitHub
- Contacta al administrador del sistema
- Revisa la documentación de Firebase y Netlify

**¡Éxito con tu despliegue!** 🚀
