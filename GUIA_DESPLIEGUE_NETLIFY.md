# 🚀 Guía Paso a Paso: Despliegue en Netlify

Esta guía te llevará de la mano para configurar correctamente tu aplicación en Netlify. **No te preocupes por cometer errores**, cada paso está explicado claramente.

---

## 📋 Antes de Empezar

Necesitarás tener a mano:
- ✅ Acceso a tu cuenta de Netlify
- ✅ Acceso a Firebase Console (https://console.firebase.google.com/)
- ✅ Las credenciales de Firebase de tu proyecto
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

Ahora vas a agregar 9 variables. **Obtén los valores de tu Firebase Console**:

#### Variables de Firebase (obtén estos valores de Firebase Console → Project Settings → General → Your apps)

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Tu API Key de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Tu Auth Domain (ej: tu-proyecto.firebaseapp.com) |
| `VITE_FIREBASE_PROJECT_ID` | Tu Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Tu Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Tu Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Tu App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Tu Measurement ID (opcional) |

#### Variables de la Aplicación

| Variable | Valor Sugerido |
|----------|----------------|
| `VITE_APP_TITLE` | Análisis de Tiempos Muertos |
| `VITE_APP_LOGO` | URL de tu logo |

Para cada variable:
1. Haz clic en **Add a variable**
2. **Key**: Nombre de la variable
3. **Value**: El valor correspondiente de Firebase Console
4. **Scopes**: Marca "All scopes"
5. Haz clic en **Create variable**

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
3. Haz clic en tu proyecto
4. En el menú lateral izquierdo, busca **Authentication** (ícono de persona)
5. Haz clic en **Authentication**
6. En la parte superior, haz clic en la pestaña **Settings**
7. Baja hasta encontrar la sección **Authorized domains**
8. Haz clic en **Add domain**
9. Copia y pega tu dominio de Netlify
   - **¿Dónde encuentro mi dominio?** En Netlify, en la página principal de tu sitio, aparece arriba en grande
10. Haz clic en **Add**

### 🎯 Paso 7: Actualizar las reglas de Firestore

1. En Firebase Console, en el menú lateral izquierdo, busca **Firestore Database**
2. Haz clic en **Firestore Database**
3. En la parte superior, haz clic en la pestaña **Rules**
4. Verás un editor de código
5. **Borra todo** el contenido actual
6. **Copia y pega** las reglas de seguridad apropiadas (ver archivo firestore.rules)
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
