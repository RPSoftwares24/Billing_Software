from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CustomerViewSet, BillViewSet, QuotationViewSet, ServiceEntryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'bills', BillViewSet)
router.register(r'quotations', QuotationViewSet) 
router.register(r'services', ServiceEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]