// app/api/sales/update-order/route.js

import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin'; // Use Admin SDK

export async function POST(request) {
    try {
      const { orderNumber, updatedData, isManual } = await request.json();
  
      if (!orderNumber || !updatedData) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      // Determine the collection based on whether the order is manual
      const collectionName = isManual ? 'manualOrders' : 'externalOrderOverrides';
      const saleDocRef = firestore.collection(collectionName).doc(orderNumber);
  
      // Update the order using set with merge
      await saleDocRef.set(updatedData, { merge: true });
  
      return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
          { error: 'Error updating order', details: error.message },
          { status: 500 }
        );
      }
  }