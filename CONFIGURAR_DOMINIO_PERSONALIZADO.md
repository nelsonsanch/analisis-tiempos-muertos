# Configurar Dominio Personalizado: maptx.sanchezcya.com

Esta guía te ayudará a configurar el subdominio **maptx.sanchezcya.com** para tu aplicación de Análisis de Tiempos Muertos.

## Paso 1: Publicar la Aplicación en Manus

Antes de configurar el dominio personalizado, debes publicar la aplicación:

1. En el panel de Manus, haz clic en el botón **"Publish"** (esquina superior derecha)
2. Espera a que se complete el despliegue
3. Anota la URL temporal que te proporciona Manus (algo como `https://xxx.manus.space`)

## Paso 2: Configurar DNS en tu Proveedor de Dominios

Necesitas agregar un registro CNAME en la configuración DNS de **sanchezcya.com**:

### Información del Registro CNAME:

```
Tipo:     CNAME
Nombre:   maptx
Valor:    [URL-de-manus-sin-https]
TTL:      3600 (o el valor por defecto)
```

### Ejemplo Práctico:

Si tu URL de Manus es `https://abc123.manus.space`, el registro sería:

```
Tipo:     CNAME
Nombre:   maptx
Valor:    abc123.manus.space
TTL:      3600
```

### Instrucciones por Proveedor:

#### **GoDaddy:**
1. Inicia sesión en tu cuenta de GoDaddy
2. Ve a "Mis Productos" → "Dominios"
3. Haz clic en "DNS" junto a sanchezcya.com
4. Haz clic en "Agregar" → Selecciona "CNAME"
5. Ingresa:
   - **Nombre:** maptx
   - **Valor:** [tu-url-de-manus.manus.space]
6. Guarda los cambios

#### **Namecheap:**
1. Inicia sesión en Namecheap
2. Ve a "Domain List" → Haz clic en "Manage" junto a sanchezcya.com
3. Ve a la pestaña "Advanced DNS"
4. Haz clic en "Add New Record"
5. Selecciona:
   - **Type:** CNAME Record
   - **Host:** maptx
   - **Value:** [tu-url-de-manus.manus.space]
6. Guarda los cambios

#### **Cloudflare:**
1. Inicia sesión en Cloudflare
2. Selecciona el dominio sanchezcya.com
3. Ve a la pestaña "DNS"
4. Haz clic en "Add record"
5. Configura:
   - **Type:** CNAME
   - **Name:** maptx
   - **Target:** [tu-url-de-manus.manus.space]
   - **Proxy status:** DNS only (nube gris, NO naranja)
6. Guarda

#### **Otros Proveedores:**
Busca la sección de "DNS Management" o "Zone File Editor" y agrega un registro CNAME con los valores indicados.

## Paso 3: Configurar Dominio Personalizado en Manus

Una vez que hayas configurado el DNS:

1. En el panel de Manus, ve a **Settings** → **Domains**
2. Haz clic en "Add Custom Domain"
3. Ingresa: **maptx.sanchezcya.com**
4. Haz clic en "Verify" o "Add Domain"
5. Manus verificará automáticamente la configuración DNS

## Paso 4: Esperar Propagación DNS

- La propagación DNS puede tardar entre **5 minutos y 48 horas**
- Normalmente tarda entre 15-30 minutos
- Puedes verificar el estado en: https://dnschecker.org

## Paso 5: Verificar Funcionamiento

Una vez propagado el DNS:

1. Abre tu navegador
2. Visita: **https://maptx.sanchezcya.com**
3. Deberías ver tu aplicación funcionando

## Solución de Problemas

### El dominio no funciona después de 24 horas:

1. Verifica que el registro CNAME esté correcto:
   ```bash
   nslookup maptx.sanchezcya.com
   ```

2. Asegúrate de que el valor del CNAME sea **solo el dominio** (sin https://)

3. Si usas Cloudflare, asegúrate de que el proxy esté **desactivado** (nube gris)

### Error de certificado SSL:

- Manus genera automáticamente certificados SSL
- Si ves un error de certificado, espera 10-15 minutos más
- El certificado se genera después de que el DNS esté propagado

## Resumen de Configuración

| Campo | Valor |
|-------|-------|
| **Subdominio** | maptx.sanchezcya.com |
| **Tipo de Registro** | CNAME |
| **Nombre/Host** | maptx |
| **Valor/Target** | [tu-url].manus.space |
| **TTL** | 3600 |

## Notas Importantes

✅ **Usa CNAME, NO un registro A**
✅ **El valor debe ser solo el dominio** (sin https://)
✅ **Si usas Cloudflare, desactiva el proxy** (nube gris)
✅ **Espera al menos 30 minutos** antes de contactar soporte

---

## ¿Necesitas Ayuda?

Si tienes problemas con la configuración:

1. Verifica que hayas seguido todos los pasos
2. Espera al menos 30 minutos después de configurar el DNS
3. Usa https://dnschecker.org para verificar la propagación
4. Contacta al soporte de tu proveedor de dominios si el DNS no se actualiza

---

**Última actualización:** 23 de noviembre, 2025
