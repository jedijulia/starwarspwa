from django.contrib import admin

from starwarspwa.models import Transmission, Subscription


class TransmissionAdmin(admin.ModelAdmin):
    list_display = ('jedi', 'message',)


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('subscription_id',)


admin.site.register(Transmission, TransmissionAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
