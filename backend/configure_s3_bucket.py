#!/usr/bin/env python
"""
Script para configurar automáticamente el bucket S3
Ejecutar con: python configure_s3_bucket.py
"""

import os
import boto3
from botocore.exceptions import ClientError
import json

def configure_s3_bucket():
    """
    Configura el bucket S3 con los permisos correctos
    """
    print("🔧 Configurando bucket S3...")
    
    # Obtener configuración desde variables de entorno
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    region = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
    
    if not bucket_name:
        print("❌ Error: AWS_STORAGE_BUCKET_NAME no está configurado")
        return False
    
    try:
        # Crear cliente S3
        s3_client = boto3.client('s3')
        
        print(f"📦 Configurando bucket: {bucket_name}")
        
        # 1. Configurar bloqueo de acceso público
        print("🔓 Configurando acceso público...")
        s3_client.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        print("✅ Acceso público configurado")
        
        # 2. Configurar política del bucket para acceso público de lectura
        print("📋 Configurando política del bucket...")
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
        
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )
        print("✅ Política del bucket configurada")
        
        # 3. Configurar CORS para permitir acceso desde el frontend
        print("🌐 Configurando CORS...")
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    'AllowedOrigins': [
                        'http://localhost:5173',
                        'http://localhost:5174',
                        'http://127.0.0.1:5173',
                        'http://127.0.0.1:5174',
                        'https://thebadgersadmin.netlify.app',
                        'https://badgersadmin.netlify.app'
                    ],
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }
        
        s3_client.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        print("✅ CORS configurado")
        
        # 4. Configurar ownership del bucket para deshabilitar ACLs
        print("👤 Configurando ownership del bucket...")
        try:
            s3_client.put_bucket_ownership_controls(
                Bucket=bucket_name,
                OwnershipControls={
                    'Rules': [
                        {
                            'ObjectOwnership': 'BucketOwnerEnforced'
                        }
                    ]
                }
            )
            print("✅ Ownership configurado (ACLs deshabilitados)")
        except ClientError as e:
            if e.response['Error']['Code'] == 'OwnershipControlsAlreadyExist':
                print("ℹ️  Ownership ya configurado")
            else:
                print(f"⚠️  Advertencia al configurar ownership: {e}")
        
        print("\n🎉 ¡Bucket S3 configurado correctamente!")
        print(f"📁 Bucket: {bucket_name}")
        print(f"🌍 Región: {region}")
        print(f"🔗 URL base: https://{bucket_name}.s3.amazonaws.com/")
        
        return True
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchBucket':
            print(f"❌ Error: El bucket '{bucket_name}' no existe")
            print("   Crea el bucket primero en la consola de AWS S3")
        elif error_code == 'AccessDenied':
            print("❌ Error: Acceso denegado")
            print("   Verifica que las credenciales tengan permisos de administrador")
        else:
            print(f"❌ Error de AWS: {error_code}")
            print(f"   Detalles: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_bucket_access():
    """
    Prueba el acceso al bucket después de la configuración
    """
    print("\n🧪 Probando acceso al bucket...")
    
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    
    try:
        s3_client = boto3.client('s3')
        
        # Probar subir un archivo de prueba
        test_content = "Test file for bucket configuration"
        test_key = "test_configuration.txt"
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=test_key,
            Body=test_content.encode('utf-8'),
            ContentType='text/plain'
        )
        print("✅ Archivo de prueba subido correctamente")
        
        # Probar acceso público
        url = f"https://{bucket_name}.s3.amazonaws.com/{test_key}"
        print(f"🔗 URL de prueba: {url}")
        
        # Limpiar archivo de prueba
        s3_client.delete_object(Bucket=bucket_name, Key=test_key)
        print("✅ Archivo de prueba eliminado")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de acceso: {e}")
        return False

if __name__ == '__main__':
    # Cargar variables de entorno
    from dotenv import load_dotenv
    load_dotenv()
    
    print("🚀 Configuración Automática de Bucket S3")
    print("=" * 50)
    
    if configure_s3_bucket():
        test_bucket_access()
        print("\n✅ Configuración completada exitosamente!")
        print("Ahora puedes ejecutar: python test_s3_connection.py")
    else:
        print("\n❌ La configuración falló. Revisa los errores arriba.") 