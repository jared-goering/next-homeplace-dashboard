
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin'; // Use Admin SDK
import admin from 'firebase-admin'; // Import admin to use FieldValue

export async function POST(request) {
  try {
    const { orderNumber, updatedData } = await request.json();

    if (!orderNumber || !updatedData) {
      console.error('Missing required fields:', { orderNumber, updatedData });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderDocRef = firestore.collection('orders').doc(orderNumber);

    // Clean updatedData by removing undefined or null values
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined || updatedData[key] === null) {
        delete updatedData[key];
      }
    });

    if (Object.keys(updatedData).length === 0) {
      console.log(`No valid fields to update for order ${orderNumber}`);
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 200 });
    }

    // Add the lastUpdated field to updatedData
    updatedData.lastUpdated = admin.firestore.FieldValue.serverTimestamp();

    // Log the data being updated
    console.log('Updating order in Firestore:', {
      orderNumber,
      updatedData,
    });

    // Use update() to update only the specified fields
    await orderDocRef.update(updatedData);

    console.log(`Order ${orderNumber} updated successfully in Firestore`);

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);

    // Handle specific Firestore errors
    if (error.code === 5 || error.code === 'not-found') { // Firestore 'not found' error
      return NextResponse.json(
        { error: 'Order not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error updating order', details: error.message },
      { status: 500 }
    );
  }
}
