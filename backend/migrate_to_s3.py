#!/usr/bin/env python
"""
Script para migrar imágenes existentes del almacenamiento local a AWS S3
Ejecutar con: python migrate_to_s3.py
"""

import os
import django
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'badgers_project.settings')
django.setup()

from api.models import Socio, Producto

def migrate_images_to_s3():
    """
    Migra todas las imágenes existentes de socios y productos a S3
    """
    print("Iniciando migración de imágenes a S3...")
    
    # Migrar fotos de socios
    socios = Socio.objects.all()
    for socio in socios:
        if socio.foto and socio.foto.name:
            try:
                # Verificar si la imagen ya existe en S3
                if default_storage.exists(socio.foto.name):
                    print(f"Imagen de socio {socio.nombre} ya existe en S3")
                    continue
                
                # Leer la imagen del almacenamiento local
                local_path = os.path.join(settings.MEDIA_ROOT, socio.foto.name)
                if os.path.exists(local_path):
                    with open(local_path, 'rb') as f:
                        content = f.read()
                    
                    # Subir a S3
                    default_storage.save(socio.foto.name, ContentFile(content))
                    print(f"Migrada imagen de socio: {socio.nombre}")
                else:
                    print(f"No se encontró imagen local para socio: {socio.nombre}")
                    
            except Exception as e:
                print(f"Error migrando imagen de socio {socio.nombre}: {e}")
    
    # Migrar fotos de productos
    productos = Producto.objects.all()
    for producto in productos:
        if producto.foto and producto.foto.name:
            try:
                # Verificar si la imagen ya existe en S3
                if default_storage.exists(producto.foto.name):
                    print(f"Imagen de producto {producto.nombre} ya existe en S3")
                    continue
                
                # Leer la imagen del almacenamiento local
                local_path = os.path.join(settings.MEDIA_ROOT, producto.foto.name)
                if os.path.exists(local_path):
                    with open(local_path, 'rb') as f:
                        content = f.read()
                    
                    # Subir a S3
                    default_storage.save(producto.foto.name, ContentFile(content))
                    print(f"Migrada imagen de producto: {producto.nombre}")
                else:
                    print(f"No se encontró imagen local para producto: {producto.nombre}")
                    
            except Exception as e:
                print(f"Error migrando imagen de producto {producto.nombre}: {e}")
    
    print("Migración completada!")

if __name__ == '__main__':
    migrate_images_to_s3() 