// app/api/sales/delete-order/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin'; // Use Admin SDK
import admin from 'firebase-admin'; // Import admin to use FieldValue

export async function POST(request) {
  try {
    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
    }

    // Reference to the document in the 'orders' collection
    const orderDocRef = firestore.collection('orders').doc(orderNumber);

    // Delete the document
    await orderDocRef.delete();

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Error deleting order' }, { status: 500 });
  }
}
