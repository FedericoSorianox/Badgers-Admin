#!/usr/bin/env python
"""
Script para migrar archivos del directorio media local a AWS S3
Ejecutar con: python migrate_files_to_s3.py
"""

import os
import django
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
import mimetypes

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'badgers_project.settings')
django.setup()

def migrate_files_to_s3():
    """
    Migra todos los archivos del directorio media local a S3
    """
    print("🚀 Iniciando migración de archivos a S3...")
    
    # Directorio media local
    media_root = Path(settings.MEDIA_ROOT) if hasattr(settings, 'MEDIA_ROOT') else Path('media')
    
    if not media_root.exists():
        print(f"❌ El directorio {media_root} no existe")
        return False
    
    print(f"📁 Migrando archivos desde: {media_root}")
    
    # Contadores
    total_files = 0
    migrated_files = 0
    error_files = 0
    
    # Recorrer todos los archivos en el directorio media
    for root, dirs, files in os.walk(media_root):
        for file in files:
            total_files += 1
            file_path = Path(root) / file
            
            # Calcular la ruta relativa para S3
            relative_path = file_path.relative_to(media_root)
            s3_path = f"media/{relative_path}"
            
            try:
                # Verificar si el archivo ya existe en S3
                if default_storage.exists(s3_path):
                    print(f"⏭️  Archivo ya existe en S3: {s3_path}")
                    continue
                
                # Leer el archivo local
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                # Determinar el tipo MIME
                mime_type, _ = mimetypes.guess_type(str(file_path))
                if not mime_type:
                    mime_type = 'application/octet-stream'
                
                # Subir a S3
                default_storage.save(s3_path, ContentFile(content))
                
                # Configurar el tipo MIME en S3
                try:
                    import boto3
                    s3_client = boto3.client('s3')
                    s3_client.copy_object(
                        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                        CopySource={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': s3_path},
                        Key=s3_path,
                        MetadataDirective='REPLACE',
                        ContentType=mime_type
                    )
                except Exception as e:
                    print(f"⚠️  Advertencia al configurar tipo MIME para {s3_path}: {e}")
                
                migrated_files += 1
                print(f"✅ Migrado: {s3_path}")
                
            except Exception as e:
                error_files += 1
                print(f"❌ Error migrando {file_path}: {e}")
    
    print(f"\n📊 Resumen de migración:")
    print(f"   Total de archivos encontrados: {total_files}")
    print(f"   Archivos migrados: {migrated_files}")
    print(f"   Errores: {error_files}")
    
    if error_files == 0:
        print("🎉 ¡Migración completada exitosamente!")
        return True
    else:
        print("⚠️  Migración completada con algunos errores")
        return False

def list_s3_files():
    """
    Lista los archivos actuales en S3
    """
    print("\n📋 Archivos actuales en S3:")
    try:
        import boto3
        s3_client = boto3.client('s3')
        
        response = s3_client.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Prefix='media/'
        )
        
        if 'Contents' in response:
            for obj in response['Contents']:
                print(f"   📄 {obj['Key']} ({obj['Size']} bytes)")
        else:
            print("   No hay archivos en S3")
            
    except Exception as e:
        print(f"❌ Error listando archivos en S3: {e}")

if __name__ == '__main__':
    print("🔄 Migración de Archivos a AWS S3")
    print("=" * 50)
    
    # Mostrar archivos actuales en S3
    list_s3_files()
    
    # Ejecutar migración
    success = migrate_files_to_s3()
    
    if success:
        print("\n📋 Archivos después de la migración:")
        list_s3_files() 