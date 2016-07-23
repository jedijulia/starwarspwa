from django.db import models


class Transmission(models.Model):
    jedi = models.CharField(max_length=100)
    message = models.TextField()


class Subscription(models.Model):
    subscription_id = models.TextField()
