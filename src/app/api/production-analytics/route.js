import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // If you're using a service account key, provide it here
  });
}

export async function GET(req) {
  try {
    const firestore = admin.firestore();
    const snapshot = await firestore.collection('fulfilledOrders').get();

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push(doc.data());
    });

    return new Response(JSON.stringify({ orders }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching orders from Firestore:', error);
    return new Response(
      JSON.stringify({
        error: 'Error fetching orders from Firestore',
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
