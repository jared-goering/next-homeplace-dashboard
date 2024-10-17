// app/api/sales/update-print-date/route.js

import { NextResponse } from 'next/server';
import { firestore } from '../../../../../firebaseConfig';
import { doc, setDoc, deleteField, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderNumber, printDateRange, isManual } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: 'OrderNumber is required' }, { status: 400 });
    }

    // Determine the collection based on whether the order is manual
    const collectionName = isManual ? 'manualOrders' : 'externalOrderOverrides';
    const saleDocRef = doc(firestore, collectionName, orderNumber);

    if (printDateRange) {
      // Update the PrintDateRange
      await setDoc(
        saleDocRef,
        {
          PrintDateRange: {
            from: new Date(printDateRange.from),
            to: printDateRange.to ? new Date(printDateRange.to) : null,
          },
        },
        { merge: true }
      );
    } else {
      // Remove the PrintDateRange field
      await updateDoc(saleDocRef, {
        PrintDateRange: deleteField(),
      });
    }

    return NextResponse.json(
      { message: 'Print date range updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating print date range:', error);
    return NextResponse.json(
      { error: 'Error updating print date range' },
      { status: 500 }
    );
  }
}
