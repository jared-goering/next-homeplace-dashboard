// app/api/sales/update-order/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin'; // Use Admin SDK
import admin from 'firebase-admin'; // Import admin to use FieldValue

export async function POST(request) {
  try {
    const { orderNumber, updatedData } = await request.json();

    if (!orderNumber || !updatedData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderDocRef = firestore.collection('orders').doc(orderNumber);

    // Add the lastUpdated field to updatedData
    updatedData.lastUpdated = admin.firestore.FieldValue.serverTimestamp();

    // Update the order using set with merge
    await orderDocRef.set(updatedData, { merge: true });

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Error updating order', details: error.message },
      { status: 500 }
    );
  }
}
