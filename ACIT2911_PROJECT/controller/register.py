from django.http import HttpResponse

def saveface(request):
    if request.method == "POST":
        img = request.FILES.get("img", None)
        user_name = request.POST.get("usr_name")
        index = img.name.rfind(".")
        ext = img.name[index:]
        f = open(u'static/facedata/base/' + user_name + "." + ext, "wb")
        for chunck in img.chunks():
            f.write(chunck)
        f.close()
        tem_file = open(u'static/js/user_tem.json', 'wb')
        tem_file.write(user_name.encode("utf-8"))
        tem_file.close()
        return HttpResponse("ok")
