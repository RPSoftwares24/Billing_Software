from django.db import models
from django.utils import timezone

STATUS_CHOICES = [
    ("Followup", "Followup"),
    ("Sitevisit", "Sitevisit"),
    ("Completed", "Completed"),
    ("Confirmed", "Confirmed"),
    ("Repair", "Repair"),
    ("Site Checkup", "Site Checkup"),
    ("Service", "Service"),
]

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True)
    address = models.TextField(null=True, blank=True)
    class Meta:
        db_table = 'customers'
        managed = True  

class Product(models.Model):
    product_name = models.CharField(max_length=255, null=True, blank=True)
    product_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    product_note = models.TextField(blank=True, null=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) 
    selling_price_include_tax = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    purchase_price_include_tax = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hsn_sac_code = models.CharField(max_length=50, blank=True, null=True)
    unit_of_measurement = models.CharField(max_length=50, blank=True, null=True)
    product_type = models.CharField(max_length=100, blank=True, null=True)
    no_itc = models.BooleanField(default=False)
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    active_product = models.BooleanField(default=True)
    is_service_product = models.BooleanField(default=False)
    non_salable_product = models.BooleanField(default=False)
    product_group = models.CharField(max_length=100, blank=True, null=True)
    stock_type = models.CharField(max_length=100, blank=True, null=True)
    stock_id = models.CharField(max_length=100, blank=True, null=True)
    batch_no = models.CharField(max_length=100, blank=True, null=True)
    model_no = models.CharField(max_length=100, blank=True, null=True)
    size = models.CharField(max_length=100, blank=True, null=True)
    mfg_date = models.DateField(blank=True, null=True)
    expire_date = models.DateField(blank=True, null=True)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    low_stock_alert = models.IntegerField(blank=True, null=True)
    discount = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    discount_in = models.CharField(max_length=20, blank=True, null=True)
    stock_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        db_table = 'products'
        managed = True
class Quotation(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Quotation #{self.id} - {self.customer.name}"


class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.product_name} * {self.quantity}"


class ServiceEntry(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="services")
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    call_for = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Followup")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer.name} - {self.status} on {self.call_for}"

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