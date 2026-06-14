import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { items, shippingDetails, paymentMethod } = body;
    
    if (!items || !items.length || !shippingDetails || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    const { name, email, address } = shippingDetails;
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
        size: item.size,
        quantity: quantity,
        priceAtPurchase: realPrice
      });
    }

    // Save order to Firestore
    const orderData = {
      userId: "guest",
      status: "processing",
      paymentMethod, // 'Card', 'Bank Deposit', 'Cash on Delivery'
      totalAmount,
      items: orderItems,
      shippingDetails: {
        name,
        email,
        address,
        carrier: "Pending",
        trackingNumber: ""
      },
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    return NextResponse.json({
      success: true,
      orderId: docRef.id,
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
