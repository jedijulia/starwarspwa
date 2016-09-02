import json
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
    notification = {
        'title': sender + '...',
        'body': message,
        'icon': '/static/starwarspwa/images/jedi-icon.png'}
    notification = json.dumps(notification)

    for subscription in Subscription.objects.all():
        subscription_info = {
            'endpoint': subscription.endpoint,
            'keys': {
                'p256dh': subscription.p256dh,
                'auth': subscription.auth}}
        headers = {'Content-Type': 'application/json'}

        WebPusher(subscription_info).send(
            notification, headers, gcm_key=settings.GCM_API_KEY)
