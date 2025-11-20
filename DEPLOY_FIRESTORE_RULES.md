# Guía Rápida: Desplegar Reglas de Firestore

## 📋 Pasos para Desplegar

### 1. Abrir Firebase Console
Ir a: https://console.firebase.google.com/project/procesos-7aeda/firestore/databases/-default-/security/rules

### 2. Seleccionar Todo el Contenido
- Hacer clic en el editor de reglas
- Presionar `Ctrl+A` (Windows/Linux) o `Cmd+A` (Mac)
- Presionar `Delete` para borrar todo

### 3. Copiar las Nuevas Reglas
Abrir el archivo `firestore.rules` en este proyecto y copiar TODO el contenido.

### 4. Pegar en el Editor
- Hacer clic en el editor de Firebase Console
- Presionar `Ctrl+V` (Windows/Linux) o `Cmd+V` (Mac)

### 5. Publicar
- Hacer clic en el botón **"Publicar"** (arriba a la derecha)
- Confirmar la publicación

---

## ⚠️ IMPORTANTE: Antes de Publicar

### Problema con Áreas Antiguas

Las áreas creadas antes de implementar multi-tenant tienen `companyId: null`. 

**Opciones:**

#### Opción A: Eliminar Áreas de Prueba (Recomendado si son datos de prueba)
1. Ir a: https://console.firebase.google.com/project/procesos-7aeda/firestore/databases/-default-/data/~2FtimeAnalysisAreas
2. Para cada área con `companyId: null`:
   - Hacer clic en el documento
   - Hacer clic en el ícono de tres puntos (⋮)
   - Seleccionar "Eliminar documento"
   - Confirmar

#### Opción B: Asignar `companyId` Manualmente
1. Ir a: https://console.firebase.google.com/project/procesos-7aeda/firestore/databases/-default-/data/~2FtimeAnalysisAreas
2. Para cada área con `companyId: null`:
   - Hacer clic en el documento
   - Hacer clic en "Agregar campo"
   - Nombre: `companyId`
   - Tipo: `string`
   - Valor: `PU6CjbTgUOi6Ig3RVfv6` (o el ID de la empresa correspondiente)
   - Guardar

#### Opción C: Dejar las Reglas Actuales (NO Recomendado)
Si no quieres lidiar con las áreas antiguas ahora, puedes dejar las reglas actuales. Pero esto significa que:
- ❌ NO hay aislamiento real a nivel de base de datos
- ❌ Cualquier usuario podría modificar el código del cliente y ver datos de otras empresas
- ❌ NO es seguro para producción

---

## 🔍 Verificar Áreas con `companyId: null`

### Desde Firebase Console:
1. Ir a: https://console.firebase.google.com/project/procesos-7aeda/firestore/databases/-default-/data/~2FtimeAnalysisAreas
2. Abrir cada documento
3. Buscar el campo `companyId`
4. Si es `null`, seguir una de las opciones anteriores

### Áreas Identificadas (al 20/11/2025):
- `6P4EOfmP7ayKy7AZF2FD` - areaName: "Gerencial" - companyId: null
- (Puede haber más, verificar manualmente)

---

## ✅ Después de Publicar las Reglas

### Probar el Aislamiento:

1. **Como Super Admin (nelson@sanchezcya.com):**
   - Ir a `/super-admin`
   - Verificar que se vean las 3 empresas
   - Intentar ir a `/` → debe redirigir a `/super-admin`

2. **Como Usuario Regular (nelsonsr.1983@gmail.com):**
   - Cerrar sesión del super admin
   - Iniciar sesión como usuario regular
   - Ir a `/`
   - Crear una nueva área
   - Verificar que solo se vean áreas de SU empresa
   - Intentar ir a `/super-admin` → debe redirigir a `/`

---

## 🆘 Si Algo Sale Mal

### Revertir las Reglas:
1. Ir a Firebase Console → Reglas
2. Hacer clic en el historial (panel izquierdo)
3. Seleccionar la versión anterior
4. Hacer clic en "Restaurar"

### Contactar Soporte:
Si tienes problemas, contacta al desarrollador con:
- Captura de pantalla del error
- Usuario con el que estás probando
- Acción que intentaste realizar

---

**Fecha:** 20 de noviembre de 2025  
**Versión de Reglas:** firestore.rules (con helper functions y aislamiento estricto)
