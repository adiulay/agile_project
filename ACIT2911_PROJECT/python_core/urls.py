from django.conf.urls import url
from controller import login, register, testFR
from python_core import views

urlpatterns = [
    url(r'^login$',views.login),
    url(r'^getface$',login.getface),
    url(r'^face$',testFR.face),
    url(r'^register$',views.register),
    url(r'^saveface$',register.saveface)
]
