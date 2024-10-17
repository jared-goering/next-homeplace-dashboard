import { NextResponse } from 'next/server';
import { firestore } from '../../../../../firebaseConfig'; // Adjust the path as necessary
import { doc, updateDoc, setDoc } from 'firebase/firestore';

// In update-order/route.js

export async function POST(request) {
    try {
      const { orderNumber, updatedData } = await request.json();
  
      if (!orderNumber || !updatedData) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      // References to the documents
      const manualOrderDocRef = doc(firestore, 'manualOrders', orderNumber);
      const externalOrderDocRef = doc(firestore, 'externalOrderOverrides', orderNumber);
  
      // Attempt to update manualOrders first
      try {
        await updateDoc(manualOrderDocRef, updatedData);
      } catch (error) {
        // If the document doesn't exist, update externalOrderOverrides
        await setDoc(externalOrderDocRef, updatedData, { merge: true });
      }
  
      return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
    } catch (error) {
      // Error handling
    }
  }