from django.contrib import admin

from starwarspwa.models import Transmission, Subscription


class TransmissionAdmin(admin.ModelAdmin):
    list_display = ('jedi', 'message',)


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('endpoint', 'p256dh', 'auth',)


admin.site.register(Transmission, TransmissionAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
