# Generated by Django 4.2.6 on 2024-02-06 16:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message_app_chating', '0010_groupchat_name'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='chat',
            options={'ordering': ['-created_at']},
        ),
    ]
