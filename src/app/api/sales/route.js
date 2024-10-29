// app/api/sales/route.js

export const runtime = 'nodejs';

import axios from 'axios';
import { firestoreAdmin as firestore } from '../../../../firebaseAdmin';
import admin from 'firebase-admin';

export async function GET(req) {
  try {
    // Fetch latest external orders from Cin7 and Printavo
    const externalOrdersCin7 = await fetchExternalOrdersCin7();
    const externalOrdersPrintavo = await fetchExternalOrdersPrintavo();
    const externalOrders = [...externalOrdersCin7, ...externalOrdersPrintavo];

    // Update Firebase with the latest external orders
    await updateExternalOrdersInFirebase(externalOrders);

    // Fetch all active orders (including manual orders) from Firebase
    const allOrders = await fetchAllOrdersFromFirebase();

    // Return the combined sales data
    return new Response(JSON.stringify({ SaleList: allOrders }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', // Prevent caching
      },
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return new Response(
      JSON.stringify({ error: 'Error fetching sales data', details: error.message }),
      { status: 500 }
    );
  }
}

// Helper function to fetch external orders from Cin7 (Dear Systems)
async function fetchExternalOrdersCin7() {
  const limit = 500; // Max limit
  const page = 1;

  const accountId = process.env.CIN7_ACCOUNT_ID;
  const applicationKey = process.env.CIN7_APPLICATION_KEY;

  if (!accountId || !applicationKey) {
    throw new Error('Missing CIN7 API credentials');
  }

  // Fetch sales data from the external API
  const response = await axios.get('https://inventory.dearsystems.com/ExternalApi/v2/saleList?STATUS=PACKED', {
    params: { Page: page, Limit: limit },
    headers: {
      'api-auth-accountid': accountId,
      'api-auth-applicationkey': applicationKey,
      'Accept': 'application/json',
    },
  });

  const salesData = response.data; // Assuming response.data has a property 'SaleList'
  const externalOrders = salesData.SaleList.map((sale) => {
    return {
      ...sale,
      OrderNumber: sale.OrderNumber,
      isManual: false,
      isActive: true,
      needsDetailFetch: true, 
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };
  });

  return externalOrders;
}

// **New** Helper function to fetch external orders from Printavo
async function fetchExternalOrdersPrintavo() {
  const statusIds = [
    // "380067",
    "454197",
    "380072",
    "380073",
    "380068",
    "380069",
    "380070",
    "380071",
  ];

  const query = `
    query GetOpenOrders($statusIds: [ID!]!) {
      orders(statusIds: $statusIds) {
        nodes {
          __typename
          ... on Quote {
            id
            visualId
            status {
              id
              name
            }
            contact {
              id
              email
              firstName
              lastName
            }
            total
            timestamps {
              createdAt
              updatedAt
            }
            customerDueAt
          }
          ... on Invoice {
            id
            visualId
            status {
              id
              name
            }
            contact {
              id
              email
              firstName
              lastName
            }
            total
            timestamps {
              createdAt
              updatedAt
            }
            customerDueAt
          }
        }
      }
    }
  `;

  const variables = {
    statusIds,
  };

  const printavoEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
  const printavoToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

  if (!printavoEmail || !printavoToken) {
    throw new Error('Missing Printavo API credentials');
  }

  const headers = {
    'Content-Type': 'application/json',
    email: printavoEmail,
    token: printavoToken,
  };

  try {
    const response = await axios.post(
      'https://www.printavo.com/api/v2',
      { query, variables },
      { headers }
    );

    const data = response.data;

    if (data.errors) {
      console.error("Printavo GraphQL errors:", data.errors);
      return [];
    } else {
      const orders = data.data.orders.nodes;
      return orders.map(transformOrderToSale);
    }
  } catch (error) {
    console.error("Error fetching open orders from Printavo:", error);
    return [];
  }
}


// Helper function to transform Printavo orders into the Sale format
function transformOrderToSale(order) {
  return {
    OrderNumber: `Printavo-${order.visualId}` || 'Unknown Order Number',
    Customer: `${order.contact.firstName || ''} ${order.contact.lastName || ''}`.trim() || 'Unknown Customer',
    OrderDate: order.timestamps?.createdAt || null,
    Status: order.status?.name || 'Unknown Status',
    PrintDateRange: order.customerDueAt
      ? {
          from: order.customerDueAt || null,
          to: order.customerDueAt || null,
        }
      : null,
    InvoiceAmount: order.total || 0,
    isManual: false,
    isActive: true,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  };
}
// Helper function to remove undefined values from an object
function removeUndefinedValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}


// Helper function to update external orders in Firebase
async function updateExternalOrdersInFirebase(externalOrders) {
  const batch = firestore.batch();

  try {
    const fieldsToUpdate = ['Status', 'isActive', 'needsDetailFetch', 'lastUpdated']; // Fields to update from external data

    for (const order of externalOrders) {
      const sanitizedOrder = removeUndefinedValues(order);
      const orderRef = firestore.collection('orders').doc(order.OrderNumber);

      // Prepare the data to update
      const updateData = {};
      for (const field of fieldsToUpdate) {
        if (sanitizedOrder.hasOwnProperty(field)) {
          updateData[field] = sanitizedOrder[field];
        }
      }

      batch.set(orderRef, updateData, { merge: true });
    }

    // Commit the batch write
    await batch.commit();

    // Identify and mark inactive external orders
    await markInactiveExternalOrders(externalOrders);
  } catch (error) {
    console.error('Error updating external orders in Firebase:', error);
  }
}



// Helper function to mark inactive external orders
async function markInactiveExternalOrders(latestExternalOrders) {
  // Fetch existing external orders from Firebase
  const existingOrdersSnapshot = await firestore.collection('orders')
    .where('isManual', '==', false)
    .get();

  const latestOrderNumbers = new Set(latestExternalOrders.map(order => order.OrderNumber));
  const inactiveBatch = firestore.batch();

  for (const doc of existingOrdersSnapshot.docs) {
    const orderNumber = doc.id;
    const orderData = doc.data();

    // Check if the order is missing from the latest data (i.e., it is inactive)
    if (!latestOrderNumbers.has(orderNumber)) {
      const orderRef = firestore.collection('orders').doc(orderNumber);
      
      // Only fetch InvoiceDate if it is null or not set
      if (!orderData.InvoiceDate) {
        const invoiceDate = await fetchInvoiceDateFromCin7(orderNumber);
        if (invoiceDate) {
          inactiveBatch.update(orderRef, {
            isActive: false,
            InvoiceDate: invoiceDate,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          inactiveBatch.update(orderRef, {
            isActive: false,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } else {
        // If InvoiceDate is already set, just mark it inactive without fetching again
        inactiveBatch.update(orderRef, {
          isActive: false,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  // Commit the batch update
  await inactiveBatch.commit();
}

// Helper function to fetch InvoiceDate from Cin7 by OrderNumber
async function fetchInvoiceDateFromCin7(orderNumber) {
  try {
    const accountId = process.env.CIN7_ACCOUNT_ID;
    const applicationKey = process.env.CIN7_APPLICATION_KEY;

    const response = await axios.get(
      `https://inventory.dearsystems.com/ExternalApi/v2/saleList`,
      {
        params: { Search: orderNumber },
        headers: {
          'api-auth-accountid': accountId,
          'api-auth-applicationkey': applicationKey,
          Accept: 'application/json',
        },
      }
    );

    const salesData = response.data.SaleList;
    if (salesData && salesData.length > 0) {
      const invoiceDate = salesData[0].InvoiceDate; // Assuming first result is the correct order
      return invoiceDate || null; // Return InvoiceDate if available, otherwise null
    } else {
      console.warn(`No data found for OrderNumber: ${orderNumber}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching InvoiceDate for OrderNumber ${orderNumber}:`, error);
    return null;
  }
}



// Helper function to fetch all orders from Firebase
async function fetchAllOrdersFromFirebase() {
  const ordersSnapshot = await firestore.collection('orders').get();

  const orders = [];

  ordersSnapshot.forEach((doc) => {
    const data = doc.data();

    // Convert PrintDateRange fields to Date objects
    if (data.PrintDateRange) {
      data.PrintDateRange = {
        from: convertToDate(data.PrintDateRange.from),
        to: convertToDate(data.PrintDateRange.to),
      };
    }

    orders.push({
      ...data,
      OrderNumber: doc.id,
    });
  });

  return orders;
}


// Helper function to convert various types to Date objects
function convertToDate(value) {
  if (value instanceof admin.firestore.Timestamp) {
    // Firestore Timestamp
    return value.toDate();
  } else if (value instanceof Date) {
    // JavaScript Date object
    return value;
  } else if (typeof value === 'string') {
    // Date string
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } else {
    return null;
  }
}
