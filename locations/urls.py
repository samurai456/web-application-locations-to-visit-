from django.urls import path
from django.conf import settings
from django.views.static import serve
from mainapp.views import mainview, \
			  			adminview, \
						signinview


urlpatterns = [
    path('', mainview),
    path('admin/', adminview),
    path('sign-in/', signinview),
    path('media/<path:path>', serve, {'document_root' : settings.MEDIA_ROOT}),
    path('static/<path:path>', serve, {'document_root' : settings.STATIC_ROOT}),
]
