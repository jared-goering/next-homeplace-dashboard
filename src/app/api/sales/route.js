// app/api/sales/route.js

import axios from 'axios';
import { firestore } from '../../../../firebaseConfig'; // Adjust the path as necessary
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(req) {
  try {
    const limit = 500; // Max limit
    const page = 1;

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

    // Fetch print date ranges from Firebase
    const salesCollection = collection(firestore, 'sales');
    const salesSnapshot = await getDocs(salesCollection);
    const printDateRanges = {};

    salesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const orderNumber = docSnap.id;
      if (data.PrintDateRange) {
        printDateRanges[orderNumber] = {
          from: data.PrintDateRange.from.toDate(),
          to: data.PrintDateRange.to ? data.PrintDateRange.to.toDate() : undefined,
        };
      }
    });

    // Fetch manual orders from Firebase
    const manualOrdersCollection = collection(firestore, 'manualOrders');
    const manualOrdersSnapshot = await getDocs(manualOrdersCollection);
    const manualOrders = [];

    manualOrdersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      manualOrders.push({
        ...data,
        OrderNumber: docSnap.id,
      });
    });

    // Merge the sales data from external API and manual orders
    const allSales = [...salesData.SaleList, ...manualOrders];

    // Merge the print date ranges
    const processedSales = allSales.map((sale) => {
      const orderNumber = sale.OrderNumber;
      const printDateRange = printDateRanges[orderNumber];

      return {
        ...sale,
        PrintDateRange: printDateRange,
      };
    });

    // Return the merged sales data
    return new Response(JSON.stringify({ SaleList: processedSales }), {
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