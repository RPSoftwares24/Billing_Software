from rest_framework import serializers
from .models import Product, Customer, Quotation, QuotationItem, ServiceEntry, Bill, BillItem  

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

    # Idhu Meta-kku veliya, Class-kku ulla irukanum
    def to_representation(self, instance):
        data = super().to_representation(instance)
        decimal_fields = [
            'selling_price',
            'selling_price_include_tax',
            'purchase_price',
            'purchase_price_include_tax',
            'gst_percent',
            'mrp',
            'discount',
        ]
        for field in decimal_fields:
            value = data.get(field)
            if value is not None:
                data[field] = str(value)
        return data

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'customer',
            'customer_details',
            'date',
            'total_amount',
            'items',
        ]

class ServiceEntrySerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source='customer', read_only=True)

    class Meta:
        model = ServiceEntry
        fields = [
            'id',
            'customer',
            'customer_details',
            'phone',
            'address',
            'call_for',
            'status',
            'amount',
            'notes',
            'created_on',
            'updated_on',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('amount') is not None:
            data['amount'] = str(data['amount'])
        return data

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