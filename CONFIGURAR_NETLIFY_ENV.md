# Configuración de Variables de Entorno en Netlify

## Problema

Los botones de IA no funcionan en producción porque las variables de entorno necesarias no están configuradas en Netlify.

**Error:** `OPENAI_API_KEY is not configured`

---

## Solución: Configurar Variables de Entorno

### Paso 1: Ir a la configuración del sitio

1. Abre tu panel de Netlify: https://app.netlify.com/sites/analisis-tiempos-muertos
2. Ve a **Site configuration** (Configuración del sitio)
3. En el menú lateral, haz clic en **Environment variables** (Variables de entorno)

### Paso 2: Agregar las variables de entorno necesarias

Haz clic en **Add a variable** y agrega las siguientes variables:

#### Variables requeridas para los botones de IA:

1. **BUILT_IN_FORGE_API_KEY**
   - Valor: (copia el valor de tu archivo `.env` local)
   - Scope: Production

2. **BUILT_IN_FORGE_API_URL**
   - Valor: (copia el valor de tu archivo `.env` local)
   - Scope: Production

3. **JWT_SECRET**
   - Valor: (copia el valor de tu archivo `.env` local)
   - Scope: Production

4. **OAUTH_SERVER_URL**
   - Valor: (copia el valor de tu archivo `.env` local)
   - Scope: Production

#### Variables de Firebase (si ya las tienes configuradas):

5. **VITE_FIREBASE_API_KEY**
6. **VITE_FIREBASE_AUTH_DOMAIN**
7. **VITE_FIREBASE_PROJECT_ID**
8. **VITE_FIREBASE_STORAGE_BUCKET**
9. **VITE_FIREBASE_MESSAGING_SENDER_ID**
10. **VITE_FIREBASE_APP_ID**

### Paso 3: Guardar y redesplegar

1. Después de agregar todas las variables, haz clic en **Save**
2. Ve a **Deploys** en el menú lateral
3. Haz clic en **Trigger deploy** → **Deploy site**
4. Espera a que termine el despliegue (2-3 minutos)

### Paso 4: Verificar que funciona

1. Abre tu sitio: https://analitx.sanchezcya.com
2. Haz clic en cualquier botón **🤖 Análisis IA**
3. Debería aparecer un diálogo con el análisis generado por IA

---

## Notas importantes

- Las variables de entorno **NO** se copian automáticamente del archivo `.env` local
- Debes configurarlas manualmente en Netlify para cada proyecto
- Si cambias alguna variable, debes redesplegar el sitio para que tome efecto
- Las variables con prefijo `VITE_` son accesibles desde el frontend
- Las variables sin prefijo solo son accesibles desde el backend (Netlify Functions)

---

## ¿Dónde encontrar los valores?

Si no tienes el archivo `.env` a mano, puedes obtener los valores de:

1. **Variables de Manus (BUILT_IN_FORGE_API_KEY, etc.)**:
   - Estas son proporcionadas automáticamente por Manus en desarrollo
   - Para producción, contacta con soporte de Manus

2. **Variables de Firebase**:
   - Ve a Firebase Console: https://console.firebase.google.com
   - Selecciona tu proyecto
   - Ve a Project Settings → General
   - Copia los valores de "Your apps" → "SDK setup and configuration"

---

## Problemas comunes

### Error: "OPENAI_API_KEY is not configured"
- Asegúrate de haber agregado `BUILT_IN_FORGE_API_KEY` y `BUILT_IN_FORGE_API_URL`
- Verifica que los valores sean correctos
- Redesplega el sitio después de agregar las variables

### Error: "OAUTH_SERVER_URL is not configured"
- Agrega la variable `OAUTH_SERVER_URL`
- Redesplega el sitio

### Los botones de IA siguen sin funcionar
- Verifica los logs de Netlify Functions: https://app.netlify.com/projects/analisis-tiempos-muertos/logs/functions/index
- Asegúrate de que todas las variables estén configuradas
- Verifica que no haya errores de tipeo en los nombres de las variables
