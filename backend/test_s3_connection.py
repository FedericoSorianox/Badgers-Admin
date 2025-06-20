#!/usr/bin/env python
"""
Script para probar la conexión a AWS S3
Ejecutar con: python test_s3_connection.py
"""

import os
import django
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'badgers_project.settings')
django.setup()

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def test_s3_connection():
    """
    Prueba la conexión a AWS S3 y las operaciones básicas
    """
    print("=== Prueba de Conexión a AWS S3 ===")
    
    # Verificar configuración
    print(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
    print(f"Región: {settings.AWS_S3_REGION_NAME}")
    print(f"Access Key ID: {settings.AWS_ACCESS_KEY_ID[:10]}..." if settings.AWS_ACCESS_KEY_ID != 'TU_ACCESS_KEY_ID_DE_AWS' else "Access Key ID: No configurado")
    
    # Probar conexión directa con boto3
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Verificar si el bucket existe
        response = s3_client.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
        print("✅ Conexión a S3 exitosa")
        print("✅ Bucket existe y es accesible")
        
    except NoCredentialsError:
        print("❌ Error: No se encontraron credenciales de AWS")
        print("   Asegúrate de configurar las variables de entorno:")
        print("   - AWS_ACCESS_KEY_ID")
        print("   - AWS_SECRET_ACCESS_KEY")
        return False
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"❌ Error: El bucket '{settings.AWS_STORAGE_BUCKET_NAME}' no existe")
        elif error_code == '403':
            print("❌ Error: Acceso denegado al bucket")
            print("   Verifica que las credenciales tengan permisos para S3")
        else:
            print(f"❌ Error de AWS: {error_code}")
        return False
    
    # Probar operaciones con Django Storage
    try:
        # Crear un archivo de prueba
        test_content = "Este es un archivo de prueba para verificar S3"
        test_filename = "test_s3_connection.txt"
        
        # Guardar archivo
        saved_path = default_storage.save(test_filename, ContentFile(test_content.encode()))
        print(f"✅ Archivo guardado en S3: {saved_path}")
        
        # Verificar que existe
        if default_storage.exists(saved_path):
            print("✅ Archivo existe en S3")
        else:
            print("❌ Error: El archivo no se guardó correctamente")
            return False
        
        # Leer archivo
        with default_storage.open(saved_path, 'r') as f:
            content = f.read()
            if content == test_content:
                print("✅ Archivo leído correctamente desde S3")
            else:
                print("❌ Error: El contenido del archivo no coincide")
                return False
        
        # Obtener URL
        url = default_storage.url(saved_path)
        print(f"✅ URL del archivo: {url}")
        
        # Eliminar archivo de prueba
        default_storage.delete(saved_path)
        print("✅ Archivo de prueba eliminado")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante las operaciones de Django Storage: {e}")
        return False

def test_media_urls():
    """
    Prueba la generación de URLs de medios
    """
    print("\n=== Prueba de URLs de Medios ===")
    
    print(f"MEDIA_URL configurado: {settings.MEDIA_URL}")
    print(f"AWS_S3_CUSTOM_DOMAIN: {settings.AWS_S3_CUSTOM_DOMAIN}")
    
    # Probar URL de ejemplo
    test_path = "socios_fotos/test.jpg"
    url = default_storage.url(test_path)
    print(f"URL de ejemplo para '{test_path}': {url}")
    
    return True

if __name__ == '__main__':
    success = test_s3_connection()
    test_media_urls()
    
    if success:
        print("\n🎉 ¡Todas las pruebas pasaron! S3 está configurado correctamente.")
    else:
        print("\n❌ Algunas pruebas fallaron. Revisa la configuración.") 