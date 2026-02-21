from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True)
    address = models.TextField(null=True, blank=True)
    class Meta:
        db_table = 'customers'
        managed = True  

class Product(models.Model):
    product_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    product_name = models.CharField(max_length=255)
    selling_price_include_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    stock_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unit_of_measurement = models.CharField(max_length=50, null=True, blank=True)
    class Meta:
        db_table = 'products'
        managed = True

class Bill(models.Model):
    bill_no = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=50, default="CASH") 
    created_at = models.DateTimeField(auto_now_add=True) 
    class Meta:
        db_table = 'billing_history'


class BillItem(models.Model):
    bill = models.ForeignKey(Bill, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2) 
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    class Meta:
        db_table = 'bill_items' 