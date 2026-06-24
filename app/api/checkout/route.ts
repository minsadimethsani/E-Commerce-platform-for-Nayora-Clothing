import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { items, shippingDetails, paymentMethod, deliveryChargeReceiptUrl } = body;
    
    if (!items || !items.length || !shippingDetails || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    const { name, email, address, phone } = shippingDetails;
    if (!name || !email || !address) {
      return NextResponse.json(
        { error: 'Missing shipping details' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Process all items and validate price
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = String(item.product.id);
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        return NextResponse.json(
          { error: `Product ${item.product.name} not found` },
          { status: 404 }
        );
      }
      
      const productData = productSnap.data();
      const realPrice = productData.price;
      const quantity = item.quantity || 1;

      totalAmount += realPrice * quantity;
      
      orderItems.push({
        productId: item.product.id,
        name: productData.name,
        color: item.product.color || "Default",
        size: item.size,
        quantity: quantity,
        priceAtPurchase: realPrice
      });
    }

    // Save order to Firestore
    const orderData: any = {
      userId: "guest",
      status: "processing",
      paymentMethod, // 'Card', 'Bank Deposit', 'Cash on Delivery'
      totalAmount,
      items: orderItems,
      shippingDetails: {
        name,
        email,
        phone: phone || "Not provided",
        address,
        carrier: "Pending",
        trackingNumber: ""
      },
      createdAt: serverTimestamp()
    };

    if (deliveryChargeReceiptUrl) {
      orderData.deliveryChargeReceiptUrl = deliveryChargeReceiptUrl;
    }

    // Use a transaction to maintain an atomic counter for ORD-001, ORD-002, etc.
    const counterRef = doc(db, "counters", "ordersCounter");
    
    const result = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let newCount = 1;
      
      if (counterSnap.exists() && typeof counterSnap.data().count === 'number') {
        newCount = counterSnap.data().count + 1;
      }
      
      // Update counter
      transaction.set(counterRef, { count: newCount }, { merge: true });
      
      // Generate formatted order number
      const orderNumber = `ORD-${String(newCount).padStart(3, '0')}`;
      
      // Generate new document ref for the order
      const newOrderRef = doc(collection(db, "orders"));
      
      // Save order with the new sequential order number
      transaction.set(newOrderRef, {
        ...orderData,
        orderNumber
      });
      
      return { docId: newOrderRef.id, orderNumber };
    });

    return NextResponse.json({
      success: true,
      orderId: result.docId,
      orderNumber: result.orderNumber,
      message: 'Order processed successfully!'
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
