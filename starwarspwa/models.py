from django.db import models


class Transmission(models.Model):
    jedi = models.CharField(max_length=100)
    message = models.TextField()


class Subscription(models.Model):
    endpoint = models.CharField(max_length=255, null=True)
    p256dh = models.CharField(max_length=255, null=True)
    auth = models.CharField(max_length=255, null=True)
