"""
Configuración local para desarrollo
Copia este archivo como settings_local.py y modifica según necesites
"""

from .settings import *

# Configuración para desarrollo local
DEBUG = True

# Para usar almacenamiento local en lugar de S3, comenta las líneas de STORAGES
# y descomenta las líneas de MEDIA_URL y MEDIA_ROOT

# Almacenamiento local (descomenta para usar)
# STORAGES = {
#     "default": {
#         "BACKEND": "django.core.files.storage.FileSystemStorage",
#     },
#     "staticfiles": {
#         "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
#     },
# }

# MEDIA_URL = '/media/'
# MEDIA_ROOT = BASE_DIR / 'media'

# Almacenamiento S3 (descomenta para usar)
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
}

# Configuración de AWS S3
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', 'AKIA5DEWLRMUL44DS3WN')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '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')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', 'badgersproducts')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-2')

AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_LOCATION = 'media'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/'

AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
# Deshabilitar ACLs ya que el bucket no los permite
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = False

# Configuración adicional para desarrollo
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'thebadgersadmin.onrender.com',
]

# Configuración de CORS para desarrollo
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://thebadgersadmin.netlify.app",
    "https://badgersadmin.netlify.app",
] 