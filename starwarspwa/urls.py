"""starwarspwa URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.contrib.staticfiles.views import serve

from starwarspwa import views


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^$', views.HomeView.as_view(), name='home-page'),
    url(r'^transmit/$', views.TransmitView.as_view(), name='transmit-page'),
    url(r'^transmissions/$', views.TransmissionsView.as_view(),
        name='transmissions-page'),
    url(r'^subscription/(?P<action>\w+)/$', views.SubscriptionView.as_view(),
        name='subscription-page'),
    url(r'^offline/$', views.OfflineView.as_view(), name='offline-page'),

    url(r'^service-worker.js$', serve,
        kwargs={'path': 'starwarspwa/javascripts/service-worker.js'}),
]
