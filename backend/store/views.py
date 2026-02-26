from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Order
import json

@api_view(['POST'])
def place_order(request):
    try:
        data = request.data
        new_order = Order.objects.create(
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            address=data['address'],
            total_amount=data['total_amount'],
            items_json=json.dumps(data['items']) 
        )
        return Response({
            "status": "success",
            "message": "Order synced with Backend!",
            "order_id": new_order.id
        }, status=201)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=400)