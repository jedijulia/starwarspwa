import json
import random

import requests
from pywebpush import WebPusher

from django.conf import settings
from django.http import JsonResponse
from django.views.generic import TemplateView, View

from starwarspwa.models import Transmission, Subscription


class HomeView(TemplateView):
    template_name = 'starwarspwa/home.html'


class TransmitView(View):

    def get(self, request, *args, **kwargs):
        jedi = request.GET.get('jedi')
        message = request.GET.get('message')
        Transmission.objects.create(jedi=jedi, message=message)

        notify_everyone(jedi, message)

        return JsonResponse({'success': True})


class TransmissionsView(TemplateView):
    template_name = 'starwarspwa/transmissions.html'

    def get_context_data(self, *args, **kwargs):
        context = super(TransmissionsView, self).\
            get_context_data(*args, **kwargs)
        context['transmissions'] = Transmission.objects.all().order_by('-id')
        return context


class SubscriptionView(View):

    def get(self, request, *args, **kwargs):
        endpoint = request.GET.get('endpoint')
        p256dh = request.GET.get('keys[p256dh]')
        auth = request.GET.get('keys[auth]')
        if kwargs['action'] == 'subscribe':
            Subscription.objects.create(
                endpoint=endpoint, p256dh=p256dh, auth=auth)
        elif kwargs['action'] == 'unsubscribe':
            Subscription.objects.get(
                endpoint=endpoint, p256dh=p256dh, auth=auth).delete()
        return JsonResponse({'success': True})


class OfflineView(TemplateView):
    template_name = 'starwarspwa/offline.html'





def notify_everyone(sender, message):
    avatar_filename = '{0}.jpg'.format(random.randrange(1, 10))
    notification = {
        'title': sender + '...',
        'body': message,
        'icon': '/static/starwarspwa/images/avatars/' + avatar_filename,
        'actions': [
            {
                'action': 'reply',
                'title': 'Reply',
                'icon': '/static/starwarspwa/images/reply.png'
            },
        ],
    }

    for subscription in Subscription.objects.all():
        if subscription.p256dh and subscription.auth:
            send_encrypted_notification(subscription, notification)
        else:
            send_unencrypted_notification(subscription, notification)


def send_encrypted_notification(subscription, notification):
    subscription_info = {
        'endpoint': subscription.endpoint,
        'keys': {
            'p256dh': subscription.p256dh,
            'auth': subscription.auth,
        },
    }
    payload = json.dumps(notification)
    WebPusher(subscription_info).send(payload, gcm_key=settings.GCM_API_KEY)


def send_unencrypted_notification(subscription, notification):
    subscription_id = subscription.endpoint[40:]
    headers = {
        'Authorization': 'key=' + settings.GCM_API_KEY,
        'Content-Type': 'application/json',
    }
    payload = {
        'registration_ids': [subscription_id],
        'notification': notification,
    }
    requests.post('https://android.googleapis.com/gcm/send',
                  data=json.dumps(payload), headers=headers)
