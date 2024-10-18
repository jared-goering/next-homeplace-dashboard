// app/api/sales/route.js

import axios from 'axios';
import { firestore } from '../../../../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

    // Fetch manual orders from Firebase
    const manualOrdersCollection = collection(firestore, 'manualOrders');
    const manualOrdersSnapshot = await getDocs(manualOrdersCollection);
    const manualOrders = [];

    manualOrdersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      manualOrders.push({
        ...data,
        OrderNumber: docSnap.id,
        isManual: true,
      });
    });

    // Fetch external order overrides from Firebase
    const overridesCollection = collection(firestore, 'externalOrderOverrides');
    const overridesSnapshot = await getDocs(overridesCollection);
    const externalOrderOverrides = {};

    overridesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Convert PrintDateRange timestamps to Date objects
      if (data.PrintDateRange) {
        data.PrintDateRange = {
          from: data.PrintDateRange.from.toDate(),
          to: data.PrintDateRange.to ? data.PrintDateRange.to.toDate() : undefined,
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
        return { ...sale, ...override };
      }
      return sale;
    });

    // Combine all sales
    const allSales = [...salesWithOverrides, ...manualOrders];

    // No longer fetching printDateRanges separately
    // Ensure that PrintDateRange from overrides and manual orders is included

    // Return the combined sales data
    return new Response(JSON.stringify({ SaleList: allSales }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
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
