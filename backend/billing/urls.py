from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CustomerViewSet, BillViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'bills', BillViewSet)  

urlpatterns = [
    path('', include(router.urls)),
]