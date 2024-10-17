import { NextResponse } from 'next/server';
import { firestore } from '../../../../../firebaseConfig'; // Adjust the path as necessary
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const newOrder = await request.json();
    const { OrderNumber, Customer, OrderDate, Status, InvoiceAmount } = newOrder;

    if (!OrderNumber || !Customer || !OrderDate || !Status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderDocRef = doc(firestore, 'manualOrders', OrderNumber);

    await setDoc(orderDocRef, {
      OrderNumber,
      Customer,
      OrderDate,
      Status,
      InvoiceAmount,
    });

    return NextResponse.json({ message: 'Order added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding new order:', error);
    return NextResponse.json({ error: 'Error adding new order' }, { status: 500 });
  }
}