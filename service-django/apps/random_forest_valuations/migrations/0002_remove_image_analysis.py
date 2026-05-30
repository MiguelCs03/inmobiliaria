from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('valuations', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS image_analysis_propertyimage CASCADE;',
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
