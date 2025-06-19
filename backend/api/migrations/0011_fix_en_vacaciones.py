from django.db import migrations

def fix_en_vacaciones(apps, schema_editor):
    # Get the model
    Socio = apps.get_model('api', 'Socio')
    # Update all records to have en_vacaciones=False if it's NULL
    Socio.objects.filter(en_vacaciones__isnull=True).update(en_vacaciones=False)

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0010_alter_producto_foto'),
    ]

    operations = [
        migrations.RunPython(fix_en_vacaciones),
    ] 