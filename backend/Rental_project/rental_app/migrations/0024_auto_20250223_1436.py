# Generated by Django 3.2 on 2025-02-23 09:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rental_app', '0023_auto_20250222_1030'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apartment',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=13, max_digits=15, null=True),
        ),
        migrations.AlterField(
            model_name='apartment',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=13, max_digits=15, null=True),
        ),
    ]
