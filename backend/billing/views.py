from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Product, Customer, Bill, BillItem
from .serializers import ProductSerializer, CustomerSerializer, BillSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all().order_by('-id')
    serializer_class = BillSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.get('items', [])
        
        try:
            with transaction.atomic():
                bill = Bill.objects.create(
                    bill_no=data.get('bill_no'),
                    customer_id=data.get('customer'),
                    total_amount=data.get('total_amount'),
                    payment_mode=data.get('payment_mode')
                )

                for item in items_data:
                    p = Product.objects.get(id=item['product_id'])
                    qty_to_reduce = float(item['qty'])

                    if float(p.stock_qty or 0) < qty_to_reduce:
                        raise Exception(f"Stock insufficient for {p.product_name}")

                    BillItem.objects.create(
                        bill=bill,
                        product=p,
                        qty=qty_to_reduce,
                        price=float(item['price']),
                        gst_percent=float(item['gst_percent'] or 0)
                    )

                    p.stock_qty = float(p.stock_qty or 0) - qty_to_reduce
                    p.save()

                return Response({"message": "Bill Saved!", "id": bill.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)