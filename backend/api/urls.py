from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuViewSet, MealViewSet

# DRF'in Router'ı, ViewSet'ler için URL'leri OTOMATİK olarak oluşturur.
# Bu, 'api/menus/' ve 'api/menus/<id>/' gibi URL'leri
# bizim elle yazmamızı engeller. (DRY ilkesi!)
router = DefaultRouter()
router.register(r'menus', MenuViewSet, basename='menu')
router.register(r'meals', MealViewSet, basename='meal')

urlpatterns = [
    path('', include(router.urls)),
]