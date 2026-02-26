from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Customer, Bill, BillItem, Quotation, QuotationItem, ServiceEntry
from .serializers import (
    ProductSerializer, CustomerSerializer, 
    BillSerializer, QuotationSerializer, ServiceEntrySerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['post'])
    def bulk_import(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Expected a list of products"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            for item in data:
                mapped = {
                    "product_id": item.get("Product ID") or item.get("product_id"),
                    "product_name": item.get("Product Name") or item.get("product_name"),
                    "product_note": item.get("Product Note"),
                    "selling_price": item.get("Sell Price") or item.get("Selling Price"),
                    "gst_percent": item.get("Tax %") or item.get("GST%"),
                    "stock_qty": item.get("Stock Qty") or 0,
                    "purchase_price_include_tax": item.get("Purchase Price (Incl. Tax)") or item.get("Purchase Price (Include Tax)"),
                    "hsn_sac_code": item.get("HSN/SAC Code") or item.get("hsn_sac_code"),
                    "unit_of_measurement": item.get("Unit of Measurement"),
                    "product_type": item.get("Product Type"),
                    "no_itc": bool(item.get("No-ITC")),
                    "active_product": bool(item.get("Active Product")),
                    "is_service_product": bool(item.get("Is Service Product ?")),
                    "non_salable_product": bool(item.get("Non-Salable Product?")),
                    "product_group": item.get("Product Group"),
                    "stock_type": item.get("Stock Type"),
                    "stock_id": item.get("Stock ID"),
                    "batch_no": item.get("Batch No"),
                    "model_no": item.get("Model No"),
                    "size": item.get("Size"),
                    "mfg_date": item.get("Mfg. Date"),
                    "expire_date": item.get("Expiry Date") or item.get("Expire Date"),
                    "mrp": item.get("MRP"),
                    "low_stock_alert": item.get("Low Stock Alert"),
                    "discount": item.get("Discount"),
                    "discount_in": item.get("Discount In"),
                   
                }
                Product.objects.update_or_create(
                    product_id=mapped["product_id"],
                    defaults=mapped
                )
            return Response({"message": "✅ Products imported successfully!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
                        raise Exception(f"Insufficient stock for {p.product_name}")

                    BillItem.objects.create(
                        bill=bill, product=p, qty=qty_to_reduce,
                        price=float(item['price']),
                        gst_percent=float(item['gst_percent'] or 0)
                    )
                    p.stock_qty = float(p.stock_qty or 0) - qty_to_reduce
                    p.save()
                return Response({"message": "Bill Saved!", "id": bill.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-id')
    serializer_class = QuotationSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.get('items', []) 
        try:
            with transaction.atomic():
                quotation = Quotation.objects.create(
                    customer_id=data.get('customer'),
                    total_amount=data.get('total_amount'),
                )
                
                for item in items_data:
                    p = Product.objects.get(id=item['product'])
                    
                    QuotationItem.objects.create(
                        quotation=quotation,
                        product=p,
                        quantity=item['quantity'],
                        price=p.selling_price_include_tax or p.selling_price or 0
                    )
                
                return Response({
                    "message": "✅ Quotation Saved with Items!", 
                    "id": quotation.id
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ServiceEntryViewSet(viewsets.ModelViewSet):
    queryset = ServiceEntry.objects.all().order_by('-created_on')
    serializer_class = ServiceEntrySerializer

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        data = request.data
        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "✅ Services created successfully!"}, status=status.HTTP_201_CREATED)