from django.shortcuts import render

# Create your views here.
def login(request):
    return render(request,"login_test.html")
def register(request):
    return render(request,"register_test.html")