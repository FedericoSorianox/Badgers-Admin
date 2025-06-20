#!/usr/bin/env python
"""
Script de instalación para AWS S3
Ejecutar con: python setup_s3.py
"""

import os
import sys
import subprocess

def install_dependencies():
    """Instala las dependencias necesarias"""
    print("📦 Instalando dependencias...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "django-storages", "boto3"])
        print("✅ Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        return False

def create_env_file():
    """Crea el archivo .env si no existe"""
    env_file = ".env"
    if os.path.exists(env_file):
        print("📝 El archivo .env ya existe")
        return True
    
    print("📝 Creando archivo .env...")
    env_content = """# Variables de entorno para AWS S3
# Reemplaza estos valores con tus credenciales reales

# Credenciales de AWS
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
AWS_STORAGE_BUCKET_NAME=el-nombre-de-tu-bucket
AWS_S3_REGION_NAME=us-east-1

# Otras variables de entorno que puedas necesitar
DATABASE_URL=tu_database_url_aqui
SECRET_KEY=tu_secret_key_aqui
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Archivo .env creado")
        print("⚠️  Recuerda configurar tus credenciales reales en el archivo .env")
        return True
    except Exception as e:
        print(f"❌ Error creando archivo .env: {e}")
        return False

def run_tests():
    """Ejecuta las pruebas de conexión"""
    print("🧪 Ejecutando pruebas de conexión...")
    try:
        subprocess.check_call([sys.executable, "test_s3_connection.py"])
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en las pruebas: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Configuración de AWS S3 para Badgers Admin")
    print("=" * 50)
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists("manage.py"):
        print("❌ Error: Este script debe ejecutarse desde el directorio backend/")
        return False
    
    # Instalar dependencias
    if not install_dependencies():
        return False
    
    # Crear archivo .env
    if not create_env_file():
        return False
    
    print("\n📋 Próximos pasos:")
    print("1. Configura tus credenciales de AWS en el archivo .env")
    print("2. Crea un bucket S3 en AWS")
    print("3. Configura los permisos del bucket")
    print("4. Ejecuta: python test_s3_connection.py")
    print("5. Si todo está bien, ejecuta: python migrate_to_s3.py")
    
    # Preguntar si quiere ejecutar las pruebas
    response = input("\n¿Quieres ejecutar las pruebas de conexión ahora? (s/n): ")
    if response.lower() in ['s', 'si', 'sí', 'y', 'yes']:
        run_tests()
    
    print("\n✅ Configuración completada!")
    return True

if __name__ == '__main__':
    main() 