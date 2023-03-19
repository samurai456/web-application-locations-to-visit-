from django.shortcuts import render, \
                            redirect
from django.http import JsonResponse
from django.db.models import Q
from .models import Location, \
                    Picture
from django.contrib.auth.models import User
from django.contrib.auth import login


def querysettojson(queryset):
    jsonresponse = []
    for record in queryset:
        previewdata = {
            'imgSrc': '/media/' + record.previewimg.name,
            'title': record.title,
            'location': record.region,
        }
        jsonresponse.append(previewdata)

    return jsonresponse

def getallpreviews():
    all_locations = Location.objects.all().order_by('dateofadding')  
    jsonresponse = querysettojson(all_locations)
    return jsonresponse


def getsearchresult(searchfor):
    if not searchfor: return []
    
    q = Q(title__icontains = searchfor) | Q(region__icontains = searchfor)
    filtered = Location.objects.filter(q).order_by('dateofadding')
    jsonresponse = querysettojson(filtered)
    return jsonresponse
   

def getregionpreviews(region):
    if not region: return []

    filtered = Location.objects.filter(region = region).order_by('dateofadding')
    jsonresponse = querysettojson(filtered)
    return jsonresponse


def getlocationdeteils(title):
    if not title: return {}

    try: location = Location.objects.get(title = title)
    except Location.DoesNotExist: return {}

    relatedpictures = location.picture_set.all()
    locationimgsrcs = ['/media/' + location.previewimg.name] + ['/media/' + img.file.name for img in relatedpictures]

    jsonresponse = {
        'pictures': locationimgsrcs,
        'title': location.title,
        'region': location.region,
        'link': location.url,
        'info': location.info,
    }

    return jsonresponse


def mainview(request):
    content = request.GET.get('get')
    if not content: 
        return render(request, 'mainpage.html')

    if content == 'main':
        jsonresponse = getallpreviews()

    elif content == 'search':
        searchfor = request.GET.get('value')
        jsonresponse = getsearchresult(searchfor)

    elif content == 'region':
        region = request.GET.get('value')
        jsonresponse = getregionpreviews(region)

    elif content == 'seeMore':
        title = request.GET.get('title')
        jsonresponse = getlocationdeteils(title)

    return JsonResponse(jsonresponse, safe = False)


def addnewlocation(request):
    location = Location()
    location.previewimg = request.FILES['previewfile']
    location.title = request.POST['title']
    location.region = request.POST['region']
    location.url = request.POST['url']
    location.info = request.POST['text']
    location.save()
    
    for key in request.FILES:
        if key == 'previewfile': continue
        
        img = Picture()
        img.file = request.FILES[key]
        img.location = location
        img.save()


def adminview(request):
    if not request.user.is_authenticated:
        return redirect('/sign-in/')

    if request.method != "POST":
        return render(request, 'addlocations.html')

    for key in request.POST:
        if 'file' in key and key != 'previewfile': continue
        if not request.POST[key]:
            return render(request, 'addlocations.html', {'state': 'fill all fields'})

    try:
        Location.objects.get(title = request.POST['title'])
        return render(request, 'addlocations.html', {'state': 'this title is already taken'})
    except Location.DoesNotExist: pass

    addnewlocation(request)
    return render(request, 'addlocations.html', {'state': 'new location added'})


def signinview(request):
    if request.user.is_authenticated:
        return redirect('/admin/')

    username = request.POST.get('username')
    password = request.POST.get('password')

    if not username or not password:
        return render(request, 'sign-in.html')

    try: user = User.objects.get(username = username)
    except User.DoesNotExist: return render(request, 'sign-in.html')

    if user.password != password:
        return render(request, 'sign-in.html')
    
    login(request, user)
    return redirect('/admin/')

    
