from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_handle_en_vacaciones'),
    ]

    operations = [
        migrations.AddField(
            model_name='socio',
            name='en_vacaciones',
            field=models.BooleanField(default=False),
        ),
        migrations.RunSQL(
            # Forward SQL: Update en_vacaciones based on inactive_status
            sql="""
            UPDATE api_socio 
            SET en_vacaciones = (inactive_status = 'vacaciones');
            """,
            # Reverse SQL: No reverse operation needed
            reverse_sql=""
        ),
    ] 