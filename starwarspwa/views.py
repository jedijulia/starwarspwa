import json

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
        pass


class OfflineView(TemplateView):
    template_name = 'starwarspwa/offline.html'
