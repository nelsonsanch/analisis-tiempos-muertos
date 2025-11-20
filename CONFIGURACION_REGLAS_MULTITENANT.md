# Configuración de Reglas de Firestore Multi-Tenant

## 🎯 Objetivo

Configurar las reglas de seguridad de Firestore para garantizar el aislamiento completo de datos entre empresas y que el super admin no vea datos de empresas cliente.

## 📋 Pasos para Configurar

### 1. Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **Firestore Database**
4. Ve a la pestaña **Reglas** (Rules)

### 2. Copiar las Nuevas Reglas

Copia el contenido del archivo `firestore.rules` de este proyecto y pégalo en el editor de reglas de Firebase Console.

### 3. Publicar las Reglas

1. Haz clic en el botón **Publicar** (Publish)
2. Espera la confirmación de que las reglas se publicaron correctamente

## 🔒 Qué Hacen las Nuevas Reglas

### Aislamiento por Empresa

- **Usuarios regulares**: Solo pueden ver y modificar áreas de su propia empresa (filtrado por `companyId`)
- **Super admin**: NO puede ver datos de empresas. Su vista estará vacía de áreas.

### Colecciones Protegidas

1. **`users`**: Perfiles de usuario
   - Cada usuario puede leer/escribir su propio perfil
   - Super admin puede modificar cualquier perfil

2. **`companies`**: Empresas registradas
   - Super admin puede leer/escribir todas las empresas
   - Usuarios pueden leer solo su propia empresa

3. **`timeAnalysisAreas`**: Áreas de análisis
   - Solo usuarios de la empresa pueden acceder
   - Super admin NO tiene acceso (aislamiento total)
   - Filtrado automático por `companyId`

4. **`globalMeasurements`**: Mediciones globales
   - Solo usuarios de la empresa pueden acceder
   - Super admin NO tiene acceso
   - Filtrado automático por `companyId`

5. **`globalTurtleItems`**: Items compartidos de metodología Tortuga
   - Todos los usuarios autenticados pueden leer/escribir
   - Compartido entre empresas para facilitar reutilización

## ⚠️ Importante

Después de publicar las reglas:

1. **Cierra sesión** en la aplicación
2. **Vuelve a iniciar sesión**
3. Verifica que:
   - Como super admin (nelson@sanchezcya.com): No ves áreas de empresas
   - Como usuario de empresa (hsesupergas@gmail.com): Solo ves áreas de tu empresa

## 🐛 Solución de Problemas

### Error: "Missing or insufficient permissions"

**Causa**: Las reglas no se publicaron correctamente o el usuario no tiene `companyId` asignado.

**Solución**:
1. Verifica que las reglas se publicaron en Firebase Console
2. Verifica que el usuario tenga el campo `companyId` en su perfil en Firestore
3. Cierra sesión y vuelve a iniciar sesión

### El super admin ve datos de empresas

**Causa**: El campo `role` del super admin no está configurado como `'super_admin'`.

**Solución**:
1. Ve a Firestore Database en Firebase Console
2. Abre la colección `users`
3. Busca el documento con el email `nelson@sanchezcya.com`
4. Verifica que el campo `role` sea exactamente `'super_admin'` (sin espacios)

### Un usuario no ve sus áreas

**Causa**: Las áreas no tienen el campo `companyId` asignado.

**Solución**:
1. Ve a Firestore Database en Firebase Console
2. Abre la colección `timeAnalysisAreas`
3. Para cada área, agrega el campo `companyId` con el ID de la empresa correspondiente
4. Guarda los cambios

## 📊 Estructura de Datos Esperada

### Documento de Usuario (`users/{userId}`)

```json
{
  "email": "usuario@empresa.com",
  "name": "Nombre Usuario",
  "role": "user",
  "companyId": "abc123xyz",
  "createdAt": "2025-11-19T20:00:00.000Z"
}
```

### Documento de Área (`timeAnalysisAreas/{areaId}`)

```json
{
  "areaName": "Gerencial",
  "managerName": "Mario Guerrero",
  "companyId": "abc123xyz",
  "positions": [...],
  "savedAt": "2025-11-14T10:30:00.000Z"
}
```

### Documento de Empresa (`companies/{companyId}`)

```json
{
  "name": "HSE Supergas",
  "status": "active",
  "createdAt": "2025-11-19T20:00:00.000Z"
}
```

## ✅ Verificación Final

Después de configurar las reglas, verifica:

- [ ] Super admin puede acceder al panel `/super-admin`
- [ ] Super admin NO ve áreas en la página principal
- [ ] Usuario de empresa ve solo áreas de su empresa
- [ ] Usuario de empresa NO puede ver áreas de otras empresas
- [ ] Las nuevas áreas se guardan con el `companyId` correcto automáticamente
