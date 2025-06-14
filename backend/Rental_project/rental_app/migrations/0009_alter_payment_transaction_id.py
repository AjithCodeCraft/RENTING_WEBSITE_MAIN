# Generated by Django 3.2 on 2025-02-16 08:49

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('rental_app', '0008_payment_transaction_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='transaction_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
