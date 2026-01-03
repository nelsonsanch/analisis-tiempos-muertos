# Configuración de Netlify para Análisis de Tiempos Muertos

Esta guía te ayudará a configurar correctamente las variables de entorno en Netlify para que la aplicación funcione correctamente.

## Problema Actual

La aplicación está mostrando errores de Firebase porque las credenciales están hardcodeadas en el código y Firebase está rechazando las solicitudes desde el dominio de Netlify por razones de seguridad.

## Solución

Necesitas configurar las siguientes variables de entorno en Netlify:

### Variables de Entorno Requeridas

Ve a tu panel de Netlify → **Site settings** → **Environment variables** y agrega las siguientes variables:

#### Variables de Firebase (IMPORTANTES)

Obtén estos valores de **Firebase Console → Project Settings → General → Your apps**:

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Tu API Key de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Tu Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Tu Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Tu Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Tu Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Tu App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Tu Measurement ID |

#### Variables de la Aplicación

| Variable | Valor Sugerido |
|----------|----------------|
| `VITE_APP_TITLE` | Análisis de Tiempos Muertos |
| `VITE_APP_LOGO` | URL de tu logo (ej: https://placehold.co/128x128/E1E7EF/1F2937?text=App) |

## Pasos para Configurar en Netlify

### Paso 1: Acceder a la configuración del sitio

1. Abre tu navegador y ve a https://app.netlify.com/
2. Inicia sesión si es necesario
3. En el dashboard, busca y haz clic en tu sitio **analisis-tiempos-muertos**
4. Una vez dentro del sitio, haz clic en **Site settings** (en el menú superior)

### Paso 2: Configurar variables de entorno

1. En el menú lateral izquierdo, busca la sección **Environment variables**
2. Haz clic en **Add a variable** (botón verde)
3. Para cada variable de la lista de arriba:
   - **Key**: Copia exactamente el nombre (ej: `VITE_FIREBASE_API_KEY`)
   - **Value**: Copia el valor correspondiente de Firebase Console
   - **Scopes**: 
     - Marca **All scopes** (recomendado)
     - O al menos marca **Production** y **Deploy previews**
   - Haz clic en **Create variable**
4. Repite el proceso para las **9 variables** listadas arriba

### Paso 3: Verificar las variables

Después de agregar todas las variables, deberías ver una lista como esta:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_APP_TITLE
VITE_APP_LOGO
```

### Paso 4: Redesplegar el sitio

1. Ve a la pestaña **Deploys** (en el menú superior)
2. Haz clic en el botón **Trigger deploy** (esquina superior derecha)
3. Selecciona **Deploy site**
4. Espera a que el despliegue termine (aparecerá un check verde cuando esté listo)
5. Esto puede tomar 2-5 minutos

## Configuración Adicional en Firebase Console

También necesitas autorizar el dominio de Netlify en Firebase:

1. **Ve a Firebase Console**
   - https://console.firebase.google.com/
   - Selecciona tu proyecto

2. **Autoriza el dominio de Netlify**
   - Ve a **Authentication** → **Settings** → **Authorized domains**
   - Haz clic en **Add domain**
   - Agrega tu dominio de Netlify
   - También agrega el dominio personalizado si tienes uno

3. **Verifica las reglas de Firestore**
   - Ve a **Firestore Database** → **Rules**
   - Asegúrate de que las reglas permitan lectura/escritura para usuarios autenticados

## Verificación

Después de configurar todo:

1. Espera a que termine el despliegue en Netlify
2. Abre tu sitio en Netlify
3. Verifica que no haya errores en la consola del navegador
4. Intenta crear un área de prueba para verificar que Firebase funciona

## Problemas Comunes

### Error: "Invalid API key"
- Verifica que copiaste correctamente el valor de `VITE_FIREBASE_API_KEY`
- Asegúrate de que no haya espacios al inicio o final

### Error: "Domain not authorized"
- Agrega tu dominio de Netlify en Firebase Console → Authentication → Authorized domains

### Los cambios no se reflejan
- Asegúrate de hacer un nuevo deploy después de agregar las variables
- Limpia la caché del navegador (Ctrl+Shift+R)

---

¿Necesitas ayuda? Abre un issue en el repositorio de GitHub.
