# Generated by Django 3.2 on 2025-02-22 05:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rental_app', '0022_alter_houseowner_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='bio',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
    ]
