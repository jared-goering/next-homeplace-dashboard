// app/api/sales/add-order/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin'; // Adjust the path as necessary
import admin from 'firebase-admin'; // Import admin to use FieldValue

export async function POST(request) {
  try {
    const newOrder = await request.json();
    console.log('New Order:', newOrder); // Debugging

    const { OrderNumber, Customer, OrderDate, Status, totalQuantity, PrintDateRange } = newOrder;

    // Validate required fields
    if (
      !OrderNumber ||
      !Customer ||
      !OrderDate ||
      !Status ||
      totalQuantity === undefined ||
      totalQuantity === null
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prefix OrderNumber with 'Manual-' to ensure uniqueness
    const prefixedOrderNumber = `Manual-${OrderNumber}`;
    const orderDocRef = firestore.collection('orders').doc(prefixedOrderNumber);

    // Prepare the order data
    const orderData = {
      OrderNumber: prefixedOrderNumber,
      Customer,
      OrderDate,
      Status,
      totalQuantity,
      PrintDateRange,
      isManual: true,
      isActive: true,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Remove undefined values
    function removeUndefinedValues(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
      );
    }
    const sanitizedOrderData = removeUndefinedValues(orderData);

    // Save the order to Firestore
    await orderDocRef.set(sanitizedOrderData, { merge: true });

    return NextResponse.json({ message: 'Order added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding new order:', error);
    return NextResponse.json({ error: 'Error adding new order' }, { status: 500 });
  }
}
