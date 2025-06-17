from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_en_vacaciones'),
    ]

    operations = [
        migrations.AddField(
            model_name='socio',
            name='en_vacaciones',
            field=models.BooleanField(default=False),
        ),
        migrations.RunSQL(
            sql="""
            UPDATE api_socio 
            SET en_vacaciones = CASE 
                WHEN inactive_status = 'vacaciones' THEN true 
                ELSE false 
            END;
            """,
            reverse_sql=""
        ),
        migrations.RemoveField(
            model_name='socio',
            name='en_vacaciones',
        ),
    ] 