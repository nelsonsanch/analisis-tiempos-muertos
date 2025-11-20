# 🔍 INSTRUCCIONES PARA CREAR ÍNDICES DE FIRESTORE

## ⚠️ IMPORTANTE: PASO OBLIGATORIO

Los errores que estás viendo son porque **Firebase necesita índices compuestos** para las consultas que filtran por `companyId` y ordenan por fecha.

---

## 📋 Opción 1: Crear Índices Automáticamente (MÁS FÁCIL)

Firebase te proporciona enlaces directos en los errores. Solo tienes que hacer clic en ellos:

### 1️⃣ Índice para Áreas (timeAnalysisAreas)

**Haz clic en este enlace** (aparece en el Error 3):
```
https://console.firebase.google.com/v1/r/project/procesos-7aeda/firestore/indexes?create_composite=Clhwcm9qZWN0cy9wcm9jZXNvcy03YWVkYS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGltZUFuYWx5c2lzQXJlYXMvaW5kZXhlcy9fEAEaDQoJY29tcGFueUlkEAEaCwoHc2F2ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

### 2️⃣ Índice para Mediciones Globales (globalMeasurements)

**Haz clic en este enlace** (aparece en el Error 2):
```
https://console.firebase.google.com/v1/r/project/procesos-7aeda/firestore/indexes?create_composite=Cllwcm9qZWN0cy9wcm9jZXNvcy03YWVkYS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZ2xvYmFsTWVhc3VyZW1lbnRzL2luZGV4ZXMvXxABGg0KCWNvbXBhbnlJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

### 3️⃣ Confirmar Creación

1. Al hacer clic en cada enlace, Firebase abrirá la consola con el índice pre-configurado
2. Haz clic en **"Crear índice"** o **"Create index"**
3. Espera unos minutos (puede tardar 5-10 minutos en crearse)
4. Verás el estado "Building..." y luego "Enabled" cuando esté listo

---

## 📋 Opción 2: Crear Índices Manualmente

Si los enlaces no funcionan, puedes crear los índices manualmente:

### 1️⃣ Abrir Firebase Console

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **procesos-7aeda**
3. En el menú lateral: **Firestore Database** → **Índices** (Indexes)
4. Haz clic en **"Crear índice"** o **"Create index"**

### 2️⃣ Índice para Áreas (timeAnalysisAreas)

**Configuración:**
- **Colección ID**: `timeAnalysisAreas`
- **Campos a indexar**:
  1. Campo: `companyId` | Orden: **Ascendente**
  2. Campo: `savedAt` | Orden: **Descendente**
- **Alcance de consulta**: Collection

Haz clic en **"Crear"**

### 3️⃣ Índice para Mediciones Globales (globalMeasurements)

**Configuración:**
- **Colección ID**: `globalMeasurements`
- **Campos a indexar**:
  1. Campo: `companyId` | Orden: **Ascendente**
  2. Campo: `createdAt` | Orden: **Descendente**
- **Alcance de consulta**: Collection

Haz clic en **"Crear"**

---

## 🔍 ¿Qué Hacen Estos Índices?

Los índices permiten que Firebase ejecute consultas eficientes que:
1. **Filtran** por `companyId` (para mostrar solo datos de tu empresa)
2. **Ordenan** por fecha (`savedAt` o `createdAt`) para mostrar los más recientes primero

Sin estos índices, Firebase no puede ejecutar estas consultas compuestas.

---

## ⏱️ Tiempo de Creación

- Los índices pueden tardar **5-15 minutos** en crearse
- Verás el estado "Building..." en Firebase Console
- Cuando cambien a "Enabled", recarga la aplicación
- Los errores desaparecerán automáticamente

---

## ✅ Verificación

Después de crear los índices:
1. Espera a que el estado sea "Enabled" en Firebase Console
2. Recarga la aplicación (F5)
3. Los errores de índices deberían desaparecer
4. Las áreas y mediciones se cargarán correctamente

---

## 🆘 Solución de Problemas

### Error: "Los índices siguen sin funcionar"
- **Causa**: Los índices aún se están creando
- **Solución**: Espera unos minutos más y recarga la página

### Error: "No puedo acceder a los enlaces"
- **Causa**: Los enlaces son específicos de tu proyecto
- **Solución**: Usa la Opción 2 (crear índices manualmente)

### Error: "No veo la opción de crear índices"
- **Causa**: Permisos insuficientes
- **Solución**: Asegúrate de ser el propietario del proyecto Firebase
