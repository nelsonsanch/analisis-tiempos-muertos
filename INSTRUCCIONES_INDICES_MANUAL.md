# 📝 INSTRUCCIONES PARA CREAR ÍNDICES MANUALMENTE

## ⚠️ IMPORTANTE

Los errores que ves son porque Firebase necesita **índices compuestos**. Sin estos índices, las consultas no funcionan y la aplicación falla.

---

## 🔧 PASOS PARA CREAR LOS ÍNDICES

### 1️⃣ Abrir Firebase Console

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **procesos-7aeda**
3. En el menú lateral izquierdo, haz clic en **"Firestore Database"**
4. En la parte superior, haz clic en la pestaña **"Índices"** (Indexes)

---

### 2️⃣ Crear Primer Índice (timeAnalysisAreas)

1. Haz clic en el botón **"Crear índice"** o **"Create index"**

2. Completa el formulario:
   - **ID de colección** (Collection ID): `timeAnalysisAreas`
   - **Alcance de consulta** (Query scope): `Collection`

3. Agrega los campos (haz clic en "Agregar campo" / "Add field"):
   
   **Campo 1:**
   - Nombre del campo: `companyId`
   - Orden: **Ascendente** (Ascending)
   
   **Campo 2:**
   - Nombre del campo: `savedAt`
   - Orden: **Descendente** (Descending)

4. Haz clic en **"Crear"** o **"Create"**

---

### 3️⃣ Crear Segundo Índice (globalMeasurements)

1. Haz clic nuevamente en **"Crear índice"** o **"Create index"**

2. Completa el formulario:
   - **ID de colección** (Collection ID): `globalMeasurements`
   - **Alcance de consulta** (Query scope): `Collection`

3. Agrega los campos:
   
   **Campo 1:**
   - Nombre del campo: `companyId`
   - Orden: **Ascendente** (Ascending)
   
   **Campo 2:**
   - Nombre del campo: `createdAt`
   - Orden: **Descendente** (Descending)

4. Haz clic en **"Crear"** o **"Create"**

---

### 4️⃣ Esperar a que se Construyan

1. Verás los índices en la lista con estado **"Building..."** (Construyendo)
2. Este proceso puede tardar **5-15 minutos**
3. Cuando el estado cambie a **"Enabled"** (Habilitado), los índices estarán listos

---

### 5️⃣ Verificar que Funcionen

1. Espera a que **AMBOS** índices estén en estado "Enabled"
2. Recarga la aplicación (presiona F5)
3. Los errores de índices deberían desaparecer
4. La aplicación debería cargar normalmente

---

## 📸 Captura de Pantalla de Referencia

Así debería verse el formulario de creación de índice:

```
┌─────────────────────────────────────────┐
│ Crear índice                            │
├─────────────────────────────────────────┤
│ ID de colección: timeAnalysisAreas      │
│ Alcance de consulta: Collection         │
│                                         │
│ Campos:                                 │
│  1. companyId    [Ascendente ▼]        │
│  2. savedAt      [Descendente ▼]       │
│                                         │
│          [Cancelar]  [Crear]           │
└─────────────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué necesito estos índices?

Firebase no puede ejecutar consultas que filtran por un campo (`companyId`) y ordenan por otro (`savedAt` o `createdAt`) sin un índice compuesto.

### ¿Cuánto tiempo tardan en crearse?

Normalmente 5-15 minutos. Si tienes muchos datos, puede tardar más.

### ¿Qué pasa si no los creo?

La aplicación seguirá mostrando errores y no cargará las áreas ni las mediciones.

### ¿Puedo usar la aplicación mientras se construyen?

No. Debes esperar a que ambos índices estén en estado "Enabled" para que la aplicación funcione correctamente.

---

## ✅ Verificación Final

Después de crear los índices, verifica en Firebase Console → Firestore Database → Índices que veas:

```
✓ timeAnalysisAreas    companyId, savedAt       Enabled
✓ globalMeasurements   companyId, createdAt     Enabled
```

Cuando ambos estén "Enabled", recarga la aplicación y todo debería funcionar.
