from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_handle_en_vacaciones_fix'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='socio',
            name='en_vacaciones',
        ),
    ] 