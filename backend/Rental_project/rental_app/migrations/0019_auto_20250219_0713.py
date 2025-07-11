# Generated by Django 3.2 on 2025-02-19 07:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rental_app', '0018_booking_checkout_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailVerification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('token', models.CharField(max_length=100, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.RenameField(
            model_name='booking',
            old_name='checkout_data',
            new_name='checkout_date',
        ),
    ]
