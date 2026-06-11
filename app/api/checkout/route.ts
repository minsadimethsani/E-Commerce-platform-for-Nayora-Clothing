import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    const { productId, size, name, email, address } = body;
    
    if (!productId || !size || !name || !email || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Simulate payment processing / backend saving delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random failure (1 in 10 chance) to demonstrate error handling
    if (Math.random() < 0.1) {
      return NextResponse.json(
        { error: 'Payment declined by the gateway. Please try again.' },
        { status: 402 } // 402 Payment Required
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
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
