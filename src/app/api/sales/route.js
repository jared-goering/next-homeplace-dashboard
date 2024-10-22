// app/api/sales/route.js

import axios from 'axios';
import { firestoreAdmin as firestore } from '../../../../firebaseAdmin'; // Use Admin SDK
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp

export async function GET(req) {
  try {
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
        'api-auth-accountid': process.env.CIN7_ACCOUNT_ID,
        'api-auth-applicationkey': process.env.CIN7_APPLICATION_KEY,
        'Accept': 'application/json',
      },
    });

    const salesData = response.data; // Assuming response.data has a property 'SaleList'

    // Fetch manual orders from Firebase using Admin SDK
    const manualOrdersSnapshot = await firestore.collection('manualOrders').get();
    const manualOrders = [];

    manualOrdersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Convert PrintDateRange fields to Date objects
      if (data.PrintDateRange) {
        data.PrintDateRange = {
          from: convertToDate(data.PrintDateRange.from),
          to: convertToDate(data.PrintDateRange.to),
        };
      }

      manualOrders.push({
        ...data,
        OrderNumber: docSnap.id,
        isManual: true,
      });
    });

    // Fetch external order overrides from Firebase
    const overridesSnapshot = await firestore.collection('externalOrderOverrides').get();
    const externalOrderOverrides = {};

    overridesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Convert PrintDateRange fields to Date objects
      if (data.PrintDateRange) {
        data.PrintDateRange = {
          from: convertToDate(data.PrintDateRange.from),
          to: convertToDate(data.PrintDateRange.to),
        };
      }

      const orderNumber = docSnap.id;
      externalOrderOverrides[orderNumber] = data;
    });

 // Merge overrides with external API sales data
const salesWithOverrides = salesData.SaleList.map((sale) => {
  const orderNumber = sale.OrderNumber;
  const override = externalOrderOverrides[orderNumber];

  if (override) {
    // Merge all fields from the override into the sale
    return {
      ...sale,
      ...override, // Overrides any matching fields with values from override
    };
  }
  return sale;
});

    // Combine all sales
    const allSales = [...salesWithOverrides, ...manualOrders];

    // Return the combined sales data
    return new Response(JSON.stringify({ SaleList: allSales }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return new Response(
      JSON.stringify({ error: 'Error fetching sales data' }),
      { status: 500 }
    );
  }
}

// Helper function to convert various types to Date objects
function convertToDate(value) {
  if (value instanceof Timestamp) {
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
