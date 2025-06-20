# Configuración de AWS S3 para Badgers Admin

Este documento explica cómo configurar AWS S3 para almacenar las imágenes de socios y productos en la nube.

## Prerrequisitos

1. Una cuenta de AWS
2. Un bucket S3 creado
3. Un usuario IAM con permisos para S3

## Paso 1: Crear un Bucket S3

1. Ve a la consola de AWS S3
2. Haz clic en "Create bucket"
3. Elige un nombre único para tu bucket (ej: `badgers-admin-media`)
4. Selecciona la región (ej: `us-east-1`)
5. **IMPORTANTE**: En "Block Public Access settings", desmarca "Block all public access" (necesario para que las imágenes sean accesibles públicamente)
6. Haz clic en "Create bucket"

## Paso 2: Configurar Permisos del Bucket

### Opción A: Configuración Automática (Recomendada)

Ejecuta el script de configuración automática:

```bash
cd backend
python configure_s3_bucket.py
```

Este script configurará automáticamente:
- Acceso público
- Política del bucket
- CORS para el frontend
- Ownership controls (para evitar problemas con ACLs)

### Opción B: Configuración Manual

Si prefieres configurar manualmente:

1. Ve a tu bucket creado
2. Ve a la pestaña "Permissions"
3. En "Block public access", haz clic en "Edit" y desmarca todas las opciones
4. En "Bucket policy", agrega esta política:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::TU-NOMBRE-DE-BUCKET/*"
        }
    ]
}
```

5. En "Object Ownership", selecciona "ACLs disabled" para evitar problemas con ACLs

## Paso 3: Crear un Usuario IAM

1. Ve a IAM en la consola de AWS
2. Haz clic en "Users" → "Create user"
3. Dale un nombre (ej: `badgers-admin-s3-user`)
4. En "Permissions", selecciona "Attach policies directly"
5. Busca y selecciona "AmazonS3FullAccess" (o crea una política más restrictiva)
6. Completa la creación del usuario

## Paso 4: Obtener las Credenciales

1. Ve al usuario IAM creado
2. Ve a la pestaña "Security credentials"
3. En "Access keys", haz clic en "Create access key"
4. Selecciona "Application running outside AWS"
5. Copia el Access Key ID y Secret Access Key

## Paso 5: Configurar Variables de Entorno

1. En el directorio `backend/`, crea un archivo `.env`
2. Agrega las siguientes variables:

```env
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
AWS_STORAGE_BUCKET_NAME=el-nombre-de-tu-bucket
AWS_S3_REGION_NAME=us-east-1
```

## Paso 6: Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

## Paso 7: Configurar el Bucket (Automático)

```bash
python configure_s3_bucket.py
```

## Paso 8: Probar la Configuración

```bash
python test_s3_connection.py
```

## Paso 9: Migrar Imágenes Existentes (Opcional)

Si ya tienes imágenes en el almacenamiento local, puedes migrarlas a S3:

```bash
python migrate_to_s3.py
```

## Paso 10: Probar la Aplicación

1. Ejecuta el servidor de desarrollo:
```bash
python manage.py runserver
```

2. Intenta subir una imagen desde el frontend
3. Verifica que la imagen se guarde en tu bucket S3

## Solución de Problemas

### Error: "AccessControlListNotSupported"

Este error ocurre cuando el bucket tiene ACLs deshabilitados. La configuración ya está preparada para esto:

- `AWS_DEFAULT_ACL = None` en settings.py
- El script `configure_s3_bucket.py` configura automáticamente el ownership del bucket

### Error: "No module named 'storages'"
```bash
pip install django-storages boto3
```

### Error: "Access Denied"
- Verifica que las credenciales de AWS sean correctas
- Asegúrate de que el usuario IAM tenga permisos para S3
- Verifica que el bucket policy permita acceso público

### Error: "Bucket does not exist"
- Verifica el nombre del bucket en `AWS_STORAGE_BUCKET_NAME`
- Asegúrate de que el bucket esté en la región correcta

### Error: "Blocked by CORS"
- Ejecuta `python configure_s3_bucket.py` para configurar CORS automáticamente
- O configura CORS manualmente en la consola de S3

## Configuración de Producción

Para producción, asegúrate de:

1. Usar variables de entorno reales (no valores por defecto)
2. Configurar CORS en tu bucket S3 si es necesario
3. Considerar usar CloudFront para mejor rendimiento
4. Implementar políticas de retención de archivos

## Estructura de Archivos en S3

Las imágenes se organizarán así en tu bucket:
```
media/
├── socios_fotos/
│   ├── socio1.jpg
│   └── socio2.png
└── productos_fotos/
    ├── producto1.jpg
    └── producto2.png
```

## Scripts Disponibles

- `setup_s3.py` - Instalación inicial
- `configure_s3_bucket.py` - Configuración automática del bucket
- `test_s3_connection.py` - Pruebas de conexión
- `migrate_to_s3.py` - Migración de imágenes existentes 