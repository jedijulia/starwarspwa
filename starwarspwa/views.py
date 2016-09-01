import json
import requests

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

        sender_id = request.GET.get('sender_id', None)
        receiver_ids = []
        for subscription in Subscription.objects.all().\
                exclude(subscription_id=sender_id):
            receiver_ids.append(subscription.subscription_id)

        headers = {
            'Authorization': 'key={}'.format(settings.GCM_API_KEY),
            'Content-Type': 'application/json'}
        payload = {
            'registration_ids': receiver_ids,
            'notification': {
                'title': jedi,
                'body': message,
                'icon': '/static/starwarspwa/images/jedi-icon.png'
            }
        }

        print '*** Sending request to GCM ***'
        print headers
        print payload

        requests.post('https://android.googleapis.com/gcm/send',
            data=json.dumps(payload), headers=headers)

        print '**** Request sent to GCM *****'

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
