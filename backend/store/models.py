from django.db import models

class Order(models.Model):
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=15)
    address = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    items_json = models.TextField() 
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending')

    def __str__(self):
        return f"Order {self.id} - {self.customer_name}"