// /app/api/sales/delete-order/route.js

import { NextResponse } from 'next/server';
import { firestore } from '../../../../../firebaseConfig'; // Adjust the path as necessary
import { doc, deleteDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
    }

    // Reference to the document in manualOrders collection
    const manualOrderDocRef = doc(firestore, 'manualOrders', orderNumber);

    // Delete the document
    await deleteDoc(manualOrderDocRef);

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Error deleting order' }, { status: 500 });
  }
}