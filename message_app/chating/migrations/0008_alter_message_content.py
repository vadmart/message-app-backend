# Generated by Django 4.2.6 on 2023-12-22 20:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('message_app_chating', '0007_message_is_edited_alter_message_edited_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='content',
            field=models.TextField(blank=True, null=True),
        ),
    ]
