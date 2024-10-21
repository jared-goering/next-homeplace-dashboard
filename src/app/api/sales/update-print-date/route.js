// app/api/sales/update-print-date/route.js

import { NextResponse } from 'next/server';
import admin from 'firebase-admin'; // Import admin
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { printDateRange, isManual, orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: 'OrderNumber is required' }, { status: 400 });
    }

    // Verify if the order exists in manualOrders
const manualOrderDoc = await firestore.collection('manualOrders').doc(orderNumber).get();
const isManualOrder = manualOrderDoc.exists;

    // Determine the collection based on whether the order is manual
    const collectionName = isManualOrder ? 'manualOrders' : 'externalOrderOverrides';
    const saleDocRef = firestore.collection(collectionName).doc(orderNumber);

    if (printDateRange) {
      // Convert ISO strings back to Date objects
      const fromDate = new Date(printDateRange.from);
      const toDate = printDateRange.to ? new Date(printDateRange.to) : null;

      // Update the PrintDateRange
      await saleDocRef.set(
        {
          PrintDateRange: {
            from: admin.firestore.Timestamp.fromDate(fromDate),
            to: toDate ? admin.firestore.Timestamp.fromDate(toDate) : null,
          },
        },
        { merge: true }
      );
    } else {
      // Remove the PrintDateRange field
      await saleDocRef.update({
        PrintDateRange: admin.firestore.FieldValue.delete(),
      });
    }

    return NextResponse.json(
      { message: 'Print date range updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating print date range:', error);
    return NextResponse.json(
      { error: 'Error updating print date range', details: error.message },
      { status: 500 }
    );
  }
}
