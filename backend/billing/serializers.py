from rest_framework import serializers
from .models import Product, Customer, Bill, BillItem  

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class BillItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.product_name')
    hsn_code = serializers.ReadOnlyField(source='product.product_id')

    class Meta:
        model = BillItem
        fields = ['product_name', 'hsn_code', 'qty', 'price', 'gst_percent']
        
class BillSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.name') 
    address = serializers.ReadOnlyField(source='customer.address')
    phone = serializers.ReadOnlyField(source='customer.phone')
    items = BillItemSerializer(many=True, read_only=True)

    class Meta:
        model = Bill  
        fields = ['id', 'bill_no', 'customer', 'customer_name', 'address', 'phone', 'total_amount', 'payment_mode', 'created_at', 'items']

