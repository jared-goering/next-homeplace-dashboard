// app/api/sales/add-order/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '../../../../../firebaseAdmin'; // Use Admin SDK
import admin from 'firebase-admin'; // Import admin to use FieldValue

export async function POST(request) {
    try {
      const newOrder = await request.json();
      console.log('New Order:', newOrder); // Debugging
  
      const { OrderNumber, Customer, OrderDate, Status, InvoiceAmount, PrintDateRange } = newOrder;
  
      if (!OrderNumber || !Customer || !OrderDate || !Status) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      // Prefix OrderNumber with 'Manual-' to ensure uniqueness
      const prefixedOrderNumber = `Manual-${OrderNumber}`;
      const orderDocRef = firestore.collection('orders').doc(prefixedOrderNumber);
  
      // Prepare the order data
      const orderData = {
        OrderNumber: prefixedOrderNumber, // Now includes 'Manual-' prefix
        Customer,
        OrderDate,
        Status,
        InvoiceAmount,
        PrintDateRange,
        isManual: true,
        isActive: true,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      function removeUndefinedValues(obj) {
        return Object.fromEntries(
          Object.entries(obj).filter(([_, v]) => v !== undefined)
        );
      }
      
  
      // Remove undefined values
      const sanitizedOrderData = removeUndefinedValues(orderData);
  
      // Save the order to Firestore
      await orderDocRef.set(sanitizedOrderData, { merge: true });
  
      return NextResponse.json({ message: 'Order added successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error adding new order:', error);
      return NextResponse.json({ error: 'Error adding new order' }, { status: 500 });
    }
  }
  