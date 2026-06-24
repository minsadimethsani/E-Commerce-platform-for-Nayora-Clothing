import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, bankDepositDetails } = body;

    if (!orderId || !bankDepositDetails) {
      return NextResponse.json(
        { error: 'Missing required order ID or bank deposit details' },
        { status: 400 }
      );
    }

    const { depositorName, referenceNumber, depositedAmount, depositedDateTime, bankName, slipUrl } = bankDepositDetails;

    if (!depositorName || !referenceNumber || !depositedAmount || !depositedDateTime || !bankName || !slipUrl) {
      return NextResponse.json(
        { error: 'Missing required bank deposit details fields' },
        { status: 400 }
      );
    }

    // Update order in Firestore
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      bankDepositDetails: {
        depositorName,
        referenceNumber,
        depositedAmount: Number(depositedAmount),
        depositedDateTime,
        bankName,
        slipUrl
      },
      // Status could be kept as processing but we can ensure it's explicitly set or updated
      status: "Processing"
    });

    return NextResponse.json({
      success: true,
      message: 'Bank deposit details updated successfully!'
    });

  } catch (error: any) {
    console.error('Bank deposit details update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
