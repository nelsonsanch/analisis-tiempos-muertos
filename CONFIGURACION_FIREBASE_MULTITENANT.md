# Configuración Firebase Multi-Tenant para MapTX

Este documento explica cómo configurar Firebase para el sistema multi-tenant de MapTX.

## 📋 Resumen del Sistema

MapTX ahora es una aplicación **multi-tenant** donde:
- Múltiples empresas pueden registrarse
- Cada empresa tiene sus propios datos completamente aislados
- Un super administrador (tú) aprueba y gestiona las empresas
- Los datos están protegidos a nivel de base de datos con reglas de seguridad

---

## 🔥 Paso 1: Desplegar Reglas de Seguridad en Firestore

Las reglas de seguridad ya están definidas en el archivo `firestore.rules`. Necesitas desplegarlas a Firebase.

### **Opción A: Desde Firebase Console (Recomendado)**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database**
4. Click en la pestaña **"Reglas"** (Rules)
5. Copia el contenido del archivo `firestore.rules` de este proyecto
6. Pégalo en el editor de reglas
7. Click en **"Publicar"** (Publish)

### **Opción B: Desde Firebase CLI**

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto (solo la primera vez)
firebase init firestore

# Desplegar reglas
firebase deploy --only firestore:rules
```

---

## 🔐 Paso 2: Crear Cuenta Super Admin

El super administrador es la cuenta que gestiona todas las empresas.

### **Credenciales del Super Admin:**
- **Email:** nelson@sanchezcya.com
- **Contraseña:** ELrey@28

### **Crear cuenta manualmente:**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication**
4. Click en **"Add user"** o **"Agregar usuario"**
5. Ingresa:
   - Email: `nelson@sanchezcya.com`
   - Contraseña: `ELrey@28`
6. Click en **"Add user"**
7. **Copia el UID** del usuario que acabas de crear

### **Crear documento en Firestore:**

1. Ve a **Firestore Database**
2. Click en **"Iniciar colección"** o busca la colección `users`
3. Crea un nuevo documento con:
   - **ID del documento:** [Pega el UID que copiaste]
   - **Campos:**
     ```
     email: "nelson@sanchezcya.com"
     name: "Nelson Sanchez"
     role: "super_admin"
     createdAt: [Timestamp actual]
     ```
4. Click en **"Guardar"**

**IMPORTANTE:** El ID del documento DEBE ser exactamente el mismo que el UID del usuario en Authentication.

---

## 📊 Paso 3: Estructura de Colecciones en Firestore

El sistema multi-tenant utiliza las siguientes colecciones:

### **1. `companies`** (Empresas)
Cada documento representa una empresa cliente.

**Campos:**
```javascript
{
  name: string,           // Nombre de la empresa
  email: string,          // Email de contacto
  contactName: string,    // Nombre del contacto
  phone: string,          // Teléfono (opcional)
  status: string,         // 'pending' | 'active' | 'inactive' | 'rejected'
  createdAt: timestamp,   // Fecha de registro
  approvedAt: timestamp,  // Fecha de aprobación (opcional)
  approvedBy: string      // UID del super admin que aprobó (opcional)
}
```

**Estados:**
- `pending`: Empresa registrada, esperando aprobación
- `active`: Empresa aprobada y activa
- `inactive`: Empresa suspendida temporalmente
- `rejected`: Empresa rechazada

### **2. `users`** (Usuarios)
Cada documento representa un usuario de la aplicación.

**Campos:**
```javascript
{
  email: string,          // Email del usuario
  name: string,           // Nombre completo
  companyId: string,      // ID de la empresa (solo para company_admin)
  role: string,           // 'super_admin' | 'company_admin'
  createdAt: timestamp    // Fecha de creación
}
```

**Roles:**
- `super_admin`: Administrador global (tú)
- `company_admin`: Administrador de una empresa cliente

**IMPORTANTE:** El ID del documento debe ser el mismo que el UID en Firebase Authentication.

### **3. `timeAnalysisAreas`** (Áreas de análisis)
Datos de áreas creadas por las empresas.

**Campo adicional:**
```javascript
{
  companyId: string,      // ID de la empresa propietaria
  // ... resto de campos existentes
}
```

### **4. `globalMeasurements`** (Mediciones globales)
Snapshots de mediciones creadas por las empresas.

**Campo adicional:**
```javascript
{
  companyId: string,      // ID de la empresa propietaria
  // ... resto de campos existentes
}
```

---

## 🔒 Paso 4: Reglas de Seguridad Explicadas

Las reglas de seguridad garantizan que:

### **Para Super Admin:**
- ✅ Puede ver y gestionar todas las empresas
- ✅ Puede ver todos los usuarios
- ✅ Puede aprobar/rechazar/activar/desactivar empresas

### **Para Empresas:**
- ✅ Solo ven sus propios datos
- ✅ No pueden ver datos de otras empresas
- ✅ Solo pueden operar si su empresa está activa
- ✅ No pueden cambiar el `companyId` de sus datos

### **Para Registro:**
- ✅ Cualquier usuario puede auto-registrarse
- ✅ Las empresas se crean con status `pending`
- ✅ Requieren aprobación del super admin

---

## 🧪 Paso 5: Probar el Sistema

### **1. Probar Super Admin:**
1. Inicia sesión con `nelson@sanchezcya.com`
2. Deberías ver el panel de Super Admin
3. Verifica que puedes ver empresas pendientes

### **2. Probar Registro de Empresa:**
1. Cierra sesión
2. Ve a `/register`
3. Completa el formulario de registro
4. Verifica que la empresa se crea con status `pending`

### **3. Probar Aprobación:**
1. Inicia sesión como super admin
2. Aprueba la empresa de prueba
3. Cierra sesión e inicia con la cuenta de la empresa
4. Verifica que puedes acceder a la aplicación

### **4. Probar Aislamiento de Datos:**
1. Crea áreas con la empresa 1
2. Inicia sesión con la empresa 2
3. Verifica que NO ves las áreas de la empresa 1

---

## ⚠️ Consideraciones de Seguridad

1. **Cambiar contraseña del super admin** después de la configuración inicial
2. **No compartir** las credenciales del super admin
3. **Revisar regularmente** las empresas pendientes
4. **Monitorear** el uso de Firebase para detectar anomalías
5. **Hacer backups** periódicos de Firestore

---

## 🆘 Solución de Problemas

### **Error: "Permission denied" al crear empresa**
- Verifica que las reglas de Firestore estén desplegadas correctamente
- Verifica que el usuario esté autenticado

### **Error: "companyId is required"**
- Verifica que el usuario tenga un documento en la colección `users`
- Verifica que el documento tenga el campo `companyId`

### **Super admin no puede ver empresas**
- Verifica que el documento del usuario tenga `role: "super_admin"`
- Verifica que el ID del documento sea el mismo que el UID en Authentication

### **Empresa aprobada no puede acceder**
- Verifica que el status de la empresa sea `active`
- Verifica que el usuario tenga el `companyId` correcto

---

## 📞 Soporte

Si tienes problemas con la configuración, revisa:
1. Los logs de Firebase Console
2. Los errores en la consola del navegador
3. Las reglas de seguridad en Firestore

---

**Última actualización:** Noviembre 2025
